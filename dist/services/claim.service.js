"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimService = void 0;
const types_1 = require("../models/types");
const helpers_1 = require("../utils/helpers");
class ClaimService {
    constructor(databaseService, cryptoService) {
        this.db = databaseService;
        this.crypto = cryptoService;
    }
    /**
     * Submit a new claim to the platform
     */
    async submitClaim(request, submitterWalletId) {
        // Validate claim submission
        this.validateClaimRequest(request);
        // Check for duplicate or similar existing claims
        const canonicalHash = (0, helpers_1.generateCanonicalHash)(request);
        const existingClaim = await this.findSimilarClaim(canonicalHash, request);
        if (existingClaim) {
            throw new Error('Similar claim already exists. Consider sponsoring or reopening the existing claim.');
        }
        // Create new claim
        const claim = {
            id: this.generateUUID(),
            submitterWalletId,
            type: request.type,
            subject: request.subject,
            predicate: request.predicate,
            object: request.object,
            canonicalHash,
            timeWindow: request.timeWindow,
            jurisdiction: request.jurisdiction,
            category: request.category,
            bounty: request.bounty,
            stake: request.stake,
            deadline: request.deadline,
            status: types_1.ClaimStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            sources: request.sources
        };
        // Store claim in database
        await this.db.saveClaim(claim);
        return claim;
    }
    /**
     * Get a claim by ID
     */
    async getClaim(claimId) {
        return await this.db.getClaim(claimId);
    }
    /**
     * Search for claims with filters
     */
    async searchClaims(filters) {
        return await this.db.searchClaims(filters);
    }
    /**
     * Update a claim's status
     */
    async updateClaimStatus(claimId, status) {
        await this.db.updateClaimStatus(claimId, status);
    }
    /**
     * Enter commit phase for a claim
     */
    async enterCommitPhase(claimId) {
        await this.updateClaimStatus(claimId, types_1.ClaimStatus.COMMIT_PHASE);
    }
    /**
     * Enter reveal phase for a claim
     */
    async enterRevealPhase(claimId) {
        await this.updateClaimStatus(claimId, types_1.ClaimStatus.REVEAL_PHASE);
    }
    /**
     * Find claims that are approaching deadline
     */
    async findClaimsNearDeadline(hours) {
        return await this.db.findClaimsNearDeadline(hours);
    }
    /**
     * Validate claim request before submission
     */
    validateClaimRequest(request) {
        if (!request.subject || !request.predicate || !request.object) {
            throw new Error('Claim must have subject, predicate, and object');
        }
        if (!request.type || !Object.values(types_1.ClaimType).includes(request.type)) {
            throw new Error('Invalid claim type');
        }
        if (!request.category || !Object.values(types_1.ClaimCategory).includes(request.category)) {
            throw new Error('Invalid claim category');
        }
        if (request.bounty < 1) {
            throw new Error('Bounty must be at least 1 satoshi');
        }
        if (request.stake < 1) {
            throw new Error('Stake must be at least 1 satoshi');
        }
        if (!request.deadline || new Date(request.deadline) <= new Date()) {
            throw new Error('Deadline must be in the future');
        }
    }
    /**
     * Check for similar existing claims
     */
    async findSimilarClaim(canonicalHash, request) {
        // Check for exact match first
        let existing = await this.db.findClaimByHash(canonicalHash);
        if (existing)
            return existing;
        // Check for semantic similarity (simplified version)
        const subjectLower = request.subject.toLowerCase();
        const predicateLower = request.predicate.toLowerCase();
        const objectLower = request.object.toLowerCase();
        const similarClaims = await this.db.searchClaims({
            category: request.category,
            limit: 10
        });
        // Basic similarity check - in a real implementation, use more sophisticated algorithms
        for (const claim of similarClaims) {
            const subjectMatch = claim.subject.toLowerCase() === subjectLower;
            const predicateMatch = claim.predicate.toLowerCase() === predicateLower;
            const objectMatch = claim.object.toLowerCase() === objectLower;
            if (subjectMatch && predicateMatch && objectMatch) {
                return claim;
            }
        }
        return null;
    }
    /**
     * Generate a UUID for new claims
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /**
     * Get claims available for verification (marketplace)
     */
    async getAvailableClaimsForVerification(filters) {
        return this.db.getAvailableClaimsForVerification(filters);
    }
}
exports.ClaimService = ClaimService;
