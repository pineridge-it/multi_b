"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const types_1 = require("../models/types");
const sqlite_1 = require("sqlite");
const path_1 = require("path");
class DatabaseService {
    constructor(dbPath) {
        const path = dbPath || (0, path_1.join)(process.cwd(), 'data', 'truthmarket.db');
        ensureDirectoryExists(path);
        this.db = (0, sqlite_1.open)({ filename: path, eager: true });
        this.initializeTables();
    }
    /**
     * Initialize database tables if they don't exist
     */
    initializeTables() {
        // Create claims table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        submitter_wallet_id TEXT NOT NULL,
        type TEXT NOT NULL,
        subject TEXT NOT NULL,
        predicate TEXT NOT NULL,
        object TEXT NOT NULL,
        canonical_hash TEXT UNIQUE NOT NULL,
        time_window_start DATETIME,
        time_window_end DATETIME,
        time_window_as_of DATETIME,
        jurisdiction TEXT,
        category TEXT NOT NULL,
        bounty INTEGER NOT NULL,
        stake INTEGER NOT NULL,
        deadline DATETIME NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);
        // Create verifiers table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS verifiers (
        id TEXT PRIMARY KEY,
        wallet_id TEXT UNIQUE NOT NULL,
        reputation_score REAL NOT NULL DEFAULT 1.0,
        expertise_categories TEXT, -- JSON array
        calibrated_accuracy REAL NOT NULL DEFAULT 0.5,
        verification_history TEXT, -- JSON array of claim IDs
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL
      )
    `);
        // Create verifications table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS verifications (
        id TEXT PRIMARY KEY,
        claim_id TEXT NOT NULL,
        verifier_wallet_id TEXT NOT NULL,
        commit_hash TEXT NOT NULL,
        verdict TEXT NOT NULL,
        confidence REAL NOT NULL,
        evidence TEXT, -- JSON array
        stake INTEGER NOT NULL,
        revealed_at DATETIME,
        timestamp DATETIME NOT NULL,
        FOREIGN KEY (claim_id) REFERENCES claims(id),
        UNIQUE(claim_id, verifier_wallet_id)
      )
    `);
        // Create evidence table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        content_hash TEXT NOT NULL,
        url TEXT,
        content_type TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        snapshot_pointer TEXT,
        description TEXT
      )
    `);
        // Create consensus_results table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS consensus_results (
        claim_id TEXT PRIMARY KEY,
        verdict TEXT NOT NULL,
        confidence REAL NOT NULL,
        is_final BOOLEAN NOT NULL DEFAULT 0,
        finalized_at DATETIME NOT NULL,
        participating_verifiers TEXT, -- JSON array
        disputed BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (claim_id) REFERENCES claims(id)
      )
    `);
        // Create disputes table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS disputes (
        id TEXT PRIMARY KEY,
        claim_id TEXT NOT NULL,
        challenger_wallet_id TEXT NOT NULL,
        bond INTEGER NOT NULL,
        reason TEXT NOT NULL,
        evidence TEXT, -- JSON array
        created_at DATETIME NOT NULL,
        resolved BOOLEAN NOT NULL DEFAULT 0,
        resolved_at DATETIME,
        FOREIGN KEY (claim_id) REFERENCES claims(id)
      )
    `);
        // Create indexes for better performance
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
      CREATE INDEX IF NOT EXISTS idx_claims_category ON claims(category);
      CREATE INDEX IF NOT EXISTS idx_claims_deadline ON claims(deadline);
      CREATE INDEX IF NOT EXISTS idx_verifications_claim_id ON verifications(claim_id);
      CREATE INDEX IF NOT EXISTS idx_verifications_verifier_wallet_id ON verifications(verifier_wallet_id);
      CREATE INDEX IF NOT EXISTS idx_verifiers_wallet_id ON verifiers(wallet_id);
    `);
    }
    /**
     * Save a claim to database
     */
    async saveClaim(claim) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO claims (
        id, submitter_wallet_id, type, subject, predicate, object,
        canonical_hash, time_window_start, time_window_end, time_window_as_of,
        jurisdiction, category, bounty, stake, deadline, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(claim.id, claim.submitterWalletId, claim.type, claim.subject, claim.predicate, claim.object, claim.canonicalHash, claim.timeWindow?.start?.toISOString(), claim.timeWindow?.end?.toISOString(), claim.timeWindow?.asOf?.toISOString(), claim.jurisdiction, claim.category, claim.bounty, claim.stake, claim.deadline.toISOString(), claim.status, claim.createdAt.toISOString(), claim.updatedAt.toISOString());
    }
    /**
     * Get a claim by ID
     */
    getClaim(claimId) {
        const stmt = this.db.prepare(`
      SELECT * FROM claims WHERE id = ?
    `);
        const row = stmt.get(claimId);
        return row ? this.mapRowToClaim(row) : null;
    }
    /**
     * Find claim by canonical hash
     */
    findClaimByHash(hash) {
        const stmt = this.db.prepare(`
      SELECT * FROM claims WHERE canonical_hash = ?
    `);
        const row = stmt.get(hash);
        return row ? this.mapRowToClaim(row) : null;
    }
    /**
     * Search claims with filters
     */
    searchClaims(filters) {
        let query = 'SELECT * FROM claims WHERE 1=1';
        const params = [];
        if (filters.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.submitterWalletId) {
            query += ' AND submitter_wallet_id = ?';
            params.push(filters.submitterWalletId);
        }
        if (!filters.includeResolved) {
            query += ' AND status != ?';
            params.push(types_1.ClaimStatus.FINALIZED);
        }
        query += ' ORDER BY created_at DESC';
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }
        if (filters.offset) {
            query += ' OFFSET ?';
            params.push(filters.offset);
        }
        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToClaim(row));
    }
    /**
     * Find claims approaching deadline
     */
    findClaimsNearDeadline(hours) {
        const stmt = this.db.prepare(`
      SELECT * FROM claims
      WHERE deadline <= datetime('now', '+${hours} hours')
      AND status != ?
      ORDER BY deadline ASC
      LIMIT 20
    `);
        const rows = stmt.all(types_1.ClaimStatus.FINALIZED);
        return rows.map(row => this.mapRowToClaim(row));
    }
    /**
     * Update a claim's status
     */
    updateClaimStatus(claimId, status) {
        const stmt = this.db.prepare(`
      UPDATE claims
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
        stmt.run(status, claimId);
    }
    /**
     * Save a verification
     */
    saveVerification(verification) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO verifications (
        id, claim_id, verifier_wallet_id, commit_hash, verdict,
        confidence, evidence, stake, revealed_at, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(verification.id, verification.claimId, verification.verifierWalletId, verification.commitHash, verification.verdict, verification.confidence, JSON.stringify(verification.evidence), verification.stake, verification.revealedAt?.toISOString(), verification.timestamp.toISOString());
    }
    /**
     * Update a verification
     */
    updateVerification(verification) {
        // Simplified for demo - in real implementation, update the database
    }
    /**
     * Find verification by claim and verifier
     */
    findVerification(claimId, verifierWalletId) {
        const stmt = this.db.prepare(`
      SELECT * FROM verifications
      WHERE claim_id = ? AND verifier_wallet_id = ?
    `);
        const row = stmt.get(claimId, verifierWalletId);
        return row ? this.mapRowToVerification(row) : null;
    }
    /**
     * Get all verifications for a claim
     */
    getVerifications(claimId) {
        const stmt = this.db.prepare(`
      SELECT * FROM verifications WHERE claim_id = ? ORDER BY timestamp ASC
    `);
        const rows = stmt.all(claimId);
        return rows.map(row => this.mapRowToVerification(row));
    }
    /**
     * Only get revealed verifications
     */
    getRevealedVerifications(claimId) {
        const stmt = this.db.prepare(`
      SELECT * FROM verifications 
      WHERE claim_id = ? AND revealed_at IS NOT NULL
      ORDER BY timestamp ASC
    `);
        const rows = stmt.all(claimId);
        return rows.map(row => this.mapRowToVerification(row));
    }
    /**
     * Save consensus result
     */
    saveConsensusResult(result) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO consensus_results (
        claim_id, verdict, confidence, is_final,
        finalized_at, participating_verifiers, disputed
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(result.claimId, result.verdict, result.confidence, result.isFinal, result.finalizedAt.toISOString(), JSON.stringify(result.participatingVerifiers), result.disputed || false);
    }
    /**
     * Get consensus result for a claim
     */
    getConsensusResult(claimId) {
        const stmt = this.db.prepare(`
      SELECT * FROM consensus_results WHERE claim_id = ?
    `);
        const row = stmt.get(claimId);
        return row ? this.mapRowToConsensusResult(row) : null;
    }
    /**
     * Private methods for mapping rows
     */
    mapRowToClaim(row) {
        const timeWindowStart = row.time_window_start ? new Date(row.time_window_start) : undefined;
        const timeWindowEnd = row.time_window_end ? new Date(row.time_window_end) : undefined;
        const timeWindowAsOf = row.time_window_as_of ? new Date(row.time_window_as_of) : undefined;
        return {
            id: row.id,
            submitterWalletId: row.submitter_wallet_id,
            type: row.type,
            subject: row.subject,
            predicate: row.predicate,
            object: row.object,
            canonicalHash: row.canonical_hash,
            timeWindow: {
                ...(timeWindowStart && { start: timeWindowStart }),
                ...(timeWindowEnd && { end: timeWindowEnd }),
                ...(timeWindowAsOf && { asOf: timeWindowAsOf })
            },
            jurisdiction: row.jurisdiction,
            category: row.category,
            bounty: row.bounty,
            stake: row.stake,
            deadline: new Date(row.deadline),
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
    mapRowToVerification(row) {
        const revealedAt = row.revealed_at ? new Date(row.revealed_at) : undefined;
        return {
            id: row.id,
            claimId: row.claim_id,
            verifierWalletId: row.verifier_wallet_id,
            commitHash: row.commit_hash,
            verdict: row.verdict,
            confidence: row.confidence,
            evidence: row.evidence ? JSON.parse(row.evidence) : [],
            stake: row.stake,
            ...(revealedAt && { revealedAt }),
            timestamp: new Date(row.timestamp)
        };
    }
    mapRowToConsensusResult(row) {
        return {
            claimId: row.claim_id,
            verdict: row.verdict,
            confidence: row.confidence,
            isFinal: Boolean(row.is_final),
            finalizedAt: new Date(row.finalized_at),
            participatingVerifiers: JSON.parse(row.participating_verifiers),
            disputed: Boolean(row.disputed)
        };
    }
    /**
     * Get claims available for verification
     */
    getAvailableClaimsForVerification(filters) {
        const conditions = [];
        const params = [];
        // Only claims that are pending (not yet in commit phase)
        conditions.push('status = ?');
        params.push('pending');
        if (filters.category) {
            conditions.push('category = ?');
            params.push(filters.category);
        }
        if (filters.minBounty !== undefined) {
            conditions.push('bounty >= ?');
            params.push(filters.minBounty);
        }
        if (filters.maxBounty !== undefined) {
            conditions.push('bounty <= ?');
            params.push(filters.maxBounty);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limitClause = filters.limit ? `LIMIT ${filters.limit}` : '';
        const sql = `
      SELECT * FROM claims
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `;
        const rows = this.db.prepare(sql).all(...params);
        return rows.map(row => this.mapRowToClaim(row));
    }
    /**
     * Close database connection
     */
    close() {
        this.db.close();
    }
}
exports.DatabaseService = DatabaseService;
/**
 * Helper function to ensure directory exists
 */
function ensureDirectoryExists(filePath) {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    // In a real implementation, use fs.mkdirSync with recursive: true
}
