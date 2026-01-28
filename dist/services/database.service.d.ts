import { Claim, Verification, ConsensusResult, ClaimStatus, ClaimCategory } from '../models/types';
export declare class DatabaseService {
    private db;
    constructor(dbPath?: string);
    /**
     * Initialize database tables if they don't exist
     */
    private initializeTables;
    /**
     * Save a claim to database
     */
    saveClaim(claim: Claim): Promise<void>;
    /**
     * Get a claim by ID
     */
    getClaim(claimId: string): Claim | null;
    /**
     * Find claim by canonical hash
     */
    findClaimByHash(hash: string): Claim | null;
    /**
     * Search claims with filters
     */
    searchClaims(filters: {
        category?: ClaimCategory;
        status?: ClaimStatus;
        submitterWalletId?: string;
        includeResolved?: boolean;
        limit?: number;
        offset?: number;
    }): Claim[];
    /**
     * Find claims approaching deadline
     */
    findClaimsNearDeadline(hours: number): Claim[];
    /**
     * Update a claim's status
     */
    updateClaimStatus(claimId: string, status: ClaimStatus): void;
    /**
     * Save a verification
     */
    saveVerification(verification: Verification): Promise<void>;
    /**
     * Update a verification
     */
    updateVerification(verification: Partial<Verification>): void;
    /**
     * Find verification by claim and verifier
     */
    findVerification(claimId: string, verifierWalletId: string): Verification | null;
    /**
     * Get all verifications for a claim
     */
    getVerifications(claimId: string): Verification[];
    /**
     * Only get revealed verifications
     */
    getRevealedVerifications(claimId: string): Verification[];
    /**
     * Save consensus result
     */
    saveConsensusResult(result: ConsensusResult): void;
    /**
     * Get consensus result for a claim
     */
    getConsensusResult(claimId: string): ConsensusResult | null;
    /**
     * Private methods for mapping rows
     */
    private mapRowToClaim;
    private mapRowToVerification;
    private mapRowToConsensusResult;
    /**
     * Get claims available for verification
     */
    getAvailableClaimsForVerification(filters: {
        category?: string;
        minBounty?: number;
        maxBounty?: number;
        limit?: number;
    }): Claim[];
    /**
     * Close database connection
     */
    close(): void;
}
