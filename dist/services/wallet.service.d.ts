import { WalletProof } from '../models/types';
export declare class WalletService {
    /**
     * Validate a wallet signature for a serialized message
     */
    validateSignature(walletId: string, message: string, signature: string): Promise<boolean>;
    /**
     * Verify an SPV proof for a transaction
     */
    verifySPVProof(proof: WalletProof): Promise<boolean>;
    /**
     * Process a payout to a verifier wallet
     */
    processPayout(walletId: string, amount: number, claimId: string): Promise<string>;
    /**
     * Calculate fees for a transaction
     */
    calculateTransactionFee(txSize: number, priorityLevel?: 'standard' | 'priority'): number;
    /**
     * Create a time-locked transaction for claim stakes
     */
    createTimeLockedEscrow(submitterWalletId: string, amount: number, claimId: string, deadlineDate: Date): string;
    /**
     * Create a commit transaction for the commit-reveal scheme
     */
    createCommitTransaction(walletId: string, amount: number, claimId: string, commitmentHash: string): string;
    /**
     * Define the maximum transaction size limit for penalty avoidance
     */
    getMaxTransactionSize(): number;
    /**
     * Get wallet balance
     */
    getWalletBalance(walletId: string): Promise<number>;
    /**
     * Generate a mock transaction ID for demonstration
     */
    private generateTxId;
    /**
     * Batch multiple payouts into a single transaction
     */
    batchPayouts(payouts: Array<{
        walletId: string;
        amount: number;
        claimId: string;
    }>): Promise<string>;
    /**
     * Estimate transaction size for batch transactions
     */
    private estimateBatchTransactionSize;
}
