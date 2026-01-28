import { SubmitVerificationRequest, ConsensusResult, TMPCommit, TMPReveal } from '../models/types';
import { DatabaseService } from './database.service';
import { CryptoService } from './crypto.service';
import { WalletService } from './wallet.service';
import { ReputationService } from './reputation.service';
export declare class VerificationService {
    private db;
    private cryptoService;
    private walletService;
    private reputationService;
    constructor(databaseService: DatabaseService, cryptoService: CryptoService, walletService: WalletService, reputationService: ReputationService);
    /**
     * Submit a verification commitment for a claim
     * This is the commit phase of commit-reveal voting
     */
    submitCommit(claimId: string, verifierWalletId: string): Promise<TMPCommit>;
    /**
     * Reveal the verification data (verdict, confidence, evidence)
     */
    revealVerification(claimId: string, verifierWalletId: string, request: SubmitVerificationRequest, nonce: string, signature: string): Promise<TMPReveal>;
    /**
     * Calculate consensus for a claim
     */
    calculateConsensus(claimId: string): Promise<ConsensusResult>;
    /**
     * Finalize claim status after dispute window
     */
    finalizeClaim(claimId: string): Promise<void>;
    /**
     * Process payouts for successful verifications
     */
    processPayouts(claimId: string): Promise<void>;
    /**
     * Calculate commitment for commit-reveal scheme
     */
    private calculateCommitment;
    /**
     * Generate a UUID
     */
    private generateUUID;
}
