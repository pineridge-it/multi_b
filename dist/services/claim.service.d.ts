import { Claim, ClaimCategory, ClaimStatus, SubmitClaimRequest } from '../models/types';
import { CryptoService } from './crypto.service';
import { DatabaseService } from './database.service';
interface ClaimFilters {
    category?: string;
    minBounty?: number;
    maxBounty?: number;
    limit?: number;
    offset?: number;
    status?: ClaimStatus;
    sortBy?: 'createdAt' | 'deadline' | 'bounty';
    sortOrder?: 'asc' | 'desc';
}
export declare class ClaimService {
    private db;
    private crypto;
    constructor(databaseService: DatabaseService, cryptoService: CryptoService);
    /**
     * Submit a new claim to the platform
     */
    submitClaim(request: SubmitClaimRequest, submitterWalletId: string): Promise<Claim>;
    /**
     * Get a claim by ID
     */
    getClaim(claimId: string): Promise<Claim | null>;
    /**
     * Search for claims with filters
     */
    searchClaims(filters: {
        category?: ClaimCategory;
        status?: ClaimStatus;
        submitterWalletId?: string;
        includeResolved?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<Claim[]>;
    /**
     * Update a claim's status
     */
    updateClaimStatus(claimId: string, status: ClaimStatus): Promise<void>;
    /**
     * Enter commit phase for a claim
     */
    enterCommitPhase(claimId: string): Promise<void>;
    /**
     * Enter reveal phase for a claim
     */
    enterRevealPhase(claimId: string): Promise<void>;
    /**
     * Find claims that are approaching deadline
     */
    findClaimsNearDeadline(hours: number): Promise<Claim[]>;
    /**
     * Validate claim request before submission
     */
    private validateClaimRequest;
    /**
     * Check for similar existing claims
     */
    private findSimilarClaim;
    /**
     * Generate a UUID for new claims
     */
    private generateUUID;
    /**
     * Get claims available for verification (marketplace)
     */
    getAvailableClaimsForVerification(filters: ClaimFilters): Promise<Claim[]>;
}
export {};
