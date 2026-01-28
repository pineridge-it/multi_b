import { Request, Response } from 'express';
import { VerificationService } from '../services/verification.service';
import { WalletService } from '../services/wallet.service';
import { ReputationService } from '../services/reputation.service';
export declare class VerificationAPI {
    private verificationService;
    private walletService;
    private reputationService;
    constructor(verificationService: VerificationService, walletService: WalletService, reputationService: ReputationService);
    /**
     * Submit verification commitment
     */
    submitCommit(req: Request, res: Response): Promise<void>;
    /**
     * Reveal verification verdict
     */
    revealVerification(req: Request, res: Response): Promise<void>;
    /**
     * Get verifications for a claim
     */
    getVerifications(req: Request, res: Response): Promise<void>;
    /**
     * Get verification history for a verifier
     */
    getVerificationHistory(req: Request, res: Response): Promise<void>;
    /**
     * Get consensus result for a claim
     */
    getConsensus(req: Request, res: Response): Promise<void>;
}
