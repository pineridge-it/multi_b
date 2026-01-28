import { Verifier, ClaimCategory } from '../models/types';
export declare class ReputationService {
    private static readonly BASE_REPUTATION;
    private static readonly ACCURACY_WEIGHT;
    private static readonly EXPERTISE_WEIGHT;
    private static readonly CALIBRATION_WEIGHT;
    private static readonly DECAY_RATE;
    /**
     * Get a verifier's reputation information
     */
    getVerifier(walletId: string): Promise<Verifier | null>;
    /**
     * Update verifier reputation based on verification performance
     */
    updateVerifierReputation(walletId: string, correct: boolean, confidence: number, category: ClaimCategory): Promise<void>;
    /**
     * Apply reputation decay for inactivity
     */
    applyReputationDecay(walletId: string, inactiveMonths: number): Promise<void>;
    /**
     * Detect potential collusion between verifiers
     */
    detectCollusion(claimId: string, verdicts: Array<{
        walletId: string;
        verdict: string;
    }>): Promise<Array<{
        walletId: string;
        score: number;
    }>>;
    /**
     * Generate a portable reputation attestation
     */
    generateReputationAttestation(walletId: string): Promise<string>;
    /**
     * Get top verifiers for a specific category
     */
    getTopVerifiers(category: ClaimCategory, limit?: number): Promise<Verifier[]>;
    /**
     * Calculate quality score for evidence
     */
    calculateEvidenceQualityScore(evidence: any[]): number;
}
