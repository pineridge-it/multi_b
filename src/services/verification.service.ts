import { 
  Claim, 
  ClaimStatus, 
  Verifier, 
  Verification, 
  Verdict, 
  Evidence, 
  SubmitVerificationRequest, 
  ConsensusResult,
  TMPCommit,
  TMPReveal
} from '../models/types';
import { DatabaseService } from './database.service';
import { CryptoService } from './crypto.service';
import { WalletService } from './wallet.service';
import { ReputationService } from './reputation.service';

export class VerificationService {
  private db: DatabaseService;
  private cryptoService: CryptoService;
  private walletService: WalletService;
  private reputationService: ReputationService;

  constructor(
    databaseService: DatabaseService,
    cryptoService: CryptoService,
    walletService: WalletService,
    reputationService: ReputationService
  ) {
    this.db = databaseService;
    this.cryptoService = cryptoService;
    this.walletService = walletService;
    this.reputationService = reputationService;
  }

  /**
   * Submit a verification commitment for a claim
   * This is the commit phase of commit-reveal voting
   */
  async submitCommit(
    claimId: string, 
    verifierWalletId: string
  ): Promise<TMPCommit> {
    // Verify claim exists and is in commit phase
    const claim = await this.db.getClaim(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.status !== ClaimStatus.COMMIT_PHASE) {
      throw new Error('Claim is not in commit phase');
    }

    // Check if verifier already submitted a commit
    const existingCommit = await this.db.findVerification(claimId, verifierWalletId);
    if (existingCommit) {
      throw new Error('Verifier has already submitted for this claim');
    }

    // Store a placeholder verification without revealing the actual data
    const verification: Verification = {
      id: this.generateUUID(),
      claimId,
      verifierWalletId,
      commitHash: '', // Will be populated in the reveal phase
      verdict: Verdict.UNVERIFIABLE, // Placeholder
      confidence: 0, // Placeholder
      evidence: [],
      stake: 0, // Placeholder, will be set in reveal
      timestamp: new Date()
    };

    await this.db.saveVerification(verification);

    // Create TMP commit message
    const commit = {
      commitHash: this.generateUUID(),
      claimHash: claim.canonicalHash,
      verifierWalletId,
      commitment: '', // Hash of actual commitment to be revealed later
      signature: '', // Will be filled with wallet signature
      timestamp: new Date()
    };

    return commit;
  }

  /**
   * Reveal the verification data (verdict, confidence, evidence)
   */
  async revealVerification(
    claimId: string,
    verifierWalletId: string,
    request: SubmitVerificationRequest,
    nonce: string,
    signature: string
  ): Promise<TMPReveal> {
    // Verify claim is in reveal phase
    const claim = await this.db.getClaim(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.status !== ClaimStatus.REVEAL_PHASE) {
      throw new Error('Claim is not in reveal phase');
    }

    // Get the existing verification for this verifier
    const verification = await this.db.findVerification(claimId, verifierWalletId);
    if (!verification) {
      throw new Error('No commit found for this verifier');
    }

    // Verify the signature and nonce match the commitment
    const commitment = await this.calculateCommitment(
      request.verdict,
      request.confidence,
      request.evidence || [],
      nonce
    );

    // Update verification with revealed data
    await this.db.updateVerification({
      ...verification,
      verdict: request.verdict,
      confidence: request.confidence,
      evidence: request.evidence || [],
      commitHash: commitment,
      revealedAt: new Date()
    });

    // Create TMP reveal message
    const reveal = {
      revealHash: this.generateUUID(),
      claimHash: claim.canonicalHash,
      verifierWalletId,
      verdict: request.verdict,
      confidence: request.confidence,
      evidenceBundle: request.evidence || [],
      nonce,
      signature,
      timestamp: new Date()
    };

    return reveal;
  }

  /**
   * Calculate consensus for a claim
   */
  async calculateConsensus(claimId: string): Promise<ConsensusResult> {
    // Get all revealed verifications for the claim
    const verifications = await this.db.getRevealedVerifications(claimId);
    const claim = await this.db.getClaim(claimId) as Claim;

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (verifications.length === 0) {
      throw new Error('No verifications found');
    }

    // Get reputation scores for all verifiers
    const verifierWeights = new Map<string, number>();
    for (const v of verifications) {
      const verifier = await this.reputationService.getVerifier(v.verifierWalletId);
      if (verifier) {
        // Calculator weight based on reputation and expertise
        const expertiseBonus = verifier.expertiseCategories.includes(claim.category) ? 1.2 : 1.0;
        verifierWeights.set(v.verifierWalletId, verifier.reputationScore * expertiseBonus);
      }
    }

    // Calculate weighted vote for each verdict
    const verdictWeights = new Map<Verdict, number>();
    let totalWeight = 0;

    for (const v of verifications) {
      const weight = verifierWeights.get(v.verifierWalletId) || 1.0;
      const currentWeight = verdictWeights.get(v.verdict) || 0;
      verdictWeights.set(v.verdict, currentWeight + weight);
      totalWeight += weight;
    }

    // Find the verdict with highest weight
    let bestVerdict = Verdict.UNVERIFIABLE;
    let bestWeight = 0;
    for (const [verdict, weight] of verdictWeights.entries()) {
      if (weight > bestWeight) {
        bestVerdict = verdict;
        bestWeight = weight;
      }
    }

    // Calculate confidence as percentage of total weight
    const confidence = totalWeight > 0 ? bestWeight / totalWeight : 0;

    // Save consensus result
    const consensusResult: ConsensusResult = {
      claimId,
      verdict: bestVerdict,
      confidence,
      isFinal: false, // Will become true after any dispute period
      finalizedAt: new Date(),
      participatingVerifiers: verifications.map(v => v.verifierWalletId)
    };

    await this.db.saveConsensusResult(consensusResult);
    
    // Update claim status
    await this.db.updateClaimStatus(claimId, ClaimStatus.CONSENSUS_REACHED);

    return consensusResult;
  }

  /**
   * Finalize claim status after dispute window
   */
  async finalizeClaim(claimId: string): Promise<void> {
    const consensusResult = await this.db.getConsensusResult(claimId);
    if (!consensusResult) {
      throw new Error('No consensus result found');
    }

    // Update consensus as final
    consensusResult.isFinal = true;
    await this.db.saveConsensusResult(consensusResult);
    
    // Update claim status
    await this.db.updateClaimStatus(claimId, ClaimStatus.FINALIZED);
  }

  /**
   * Process payouts for successful verifications
   */
  async processPayouts(claimId: string): Promise<void> {
    const consensusResult = await this.db.getConsensusResult(claimId);
    if (!consensusResult || !consensusResult.isFinal) {
      throw new Error('Claim not finalized or no consensus result found');
    }

    const claim = await this.db.getClaim(claimId) as Claim;
    const verifications = await this.db.getVerifications(claimId);

    // Calculate verifier rewards based on correctness, reputation, and evidence quality
    const rewardPool = claim.bounty * 0.98; // 2% platform fee

    for (const v of verifications) {
      if (v.verdict === consensusResult.verdict) {
        // Correct verdict gets reward
        const verifier = await this.reputationService.getVerifier(v.verifierWalletId);
        const reputationBonus = verifier?.reputationScore || 1.0;
        
        // Complex reward calculation in real implementation
        const reward = (rewardPool / verifications.length) * reputationBonus;
        
        // Process payout through wallet service
        await this.walletService.processPayout(v.verifierWalletId, reward, claimId);
      }
    }
  }

  /**
   * Calculate commitment for commit-reveal scheme
   */
  private async calculateCommitment(
    verdict: Verdict,
    confidence: number,
    evidence: Evidence[],
    nonce: string
  ): Promise<string> {
    const data = {
      verdict,
      confidence,
      evidence,
      nonce
    };
    
    return await this.cryptoService.hash(JSON.stringify(data));
  }

  /**
   * Generate a UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get verifications for a claim
   */
  async getVerifications(claimId: string): Promise<Verification[]> {
    return this.db.getVerifications(claimId);
  }
}