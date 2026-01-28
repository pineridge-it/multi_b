import { Request, Response } from 'express';
import { ClaimService } from '../services/claim.service';
import { WalletService } from '../services/wallet.service';
export declare class ClaimAPI {
    private claimService;
    private walletService;
    constructor(claimService: ClaimService, walletService: WalletService);
    /**
     * Submit a new claim
     */
    submitClaim(req: Request, res: Response): Promise<void>;
    /**
     * Get a specific claim
     */
    getClaim(req: Request, res: Response): Promise<void>;
    /**
     * Search claims with filters
     */
    searchClaims(req: Request, res: Response): Promise<void>;
    /**
     * Get claims nearing deadline
     */
    getClaimsNearDeadline(req: Request, res: Response): Promise<void>;
    /**
     * Get claims available for verification (marketplace)
     */
    getAvailableClaimsForVerification(req: Request, res: Response): Promise<void>;
    /**
     * Update a claim's status
     */
    updateClaimStatus(req: Request, res: Response): Promise<void>;
    /**
     * Get claims for a specific user
     */
    getUserClaims(req: Request, res: Response): Promise<void>;
    /**
     * Extract wallet ID and signature from request headers/authorization
     */
    private extractAuthFromRequest;
    /**
     * Check if wallet ID belongs to an admin
     */
    private isAdmin;
}
