import { VerificationService } from '../../src/services/verification.service';
import { DatabaseService } from '../../src/services/database.service';
import { CryptoService } from '../../src/services/crypto.service';
import { WalletService } from '../../src/services/wallet.service';
import { ReputationService } from '../../src/services/reputation.service';
import { ClaimType, ClaimCategory, ClaimStatus, Verifier, Verdict } from '../../src/models/types';

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let databaseService: DatabaseService;
  let cryptoService: CryptoService;
  let walletService: WalletService;
  let reputationService: ReputationService;

  beforeEach(async () => {
    // Set up in-memory database for tests
    databaseService = new DatabaseService(':memory:');
    await databaseService.initializeTables();
    
    cryptoService = new CryptoService();
    walletService = new WalletService();
    reputationService = new ReputationService(databaseService);
    verificationService = new VerificationService(
      databaseService, 
      cryptoService, 
      walletService, 
      reputationService
    );

    // Create a test verifier
    await reputationService.updateVerifierReputation({
      walletId: 'test-verifier-id',
      reputationScore: 5.0,
      totalVerifications: 10,
      correctVerifications: 9,
      expertiseCategories: [ClaimCategory.OTHER],
      isActive: true,
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    });
  });

  afterEach(async () => {
    // Clean up database after each test
    databaseService.close();
  });

  describe('submitCommit', () => {
    it('should submit a verification commit successfully', async () => {
      // Arrange
      const claimData = {
        title: 'Test Claim for Verification',
        description: 'This is a test claim for verification',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 1000,
        deadlineHours: 24,
        walletId: 'test-wallet-id',
        sources: []
      };

      const verifierId = 'test-verifier-id';

      // Create a test claim first
      const claimId = 'test-claim-id';
      // In a real implementation we would create a claim through ClaimService

      // Act
      const commit = await verificationService.submitCommit(claimId, verifierId);

      // Assert
      expect(commit).toBeDefined();
      expect(commit.claimId).toEqual(claimId);
      expect(commit.verifierId).toEqual(verifierId);
      expect(commit.commitHash).toBeDefined();
      expect(commit.timestamp).toBeDefined();
      expect(commit.revealed).toEqual(false);
      expect(commit.revealHash).toBeDefined();
    });

    it('should handle duplicate commits from same verifier', async () => {
      // Arrange
      const claimId = 'test-claim-id';
      const verifierId = 'test-verifier-id';

      // Act
      await verificationService.submitCommit(claimId, verifierId);

      // Assert - Second commit should fail
      await expect(verificationService.submitCommit(claimId, verifierId))
        .rejects.toThrow('Verification already registered');
    });
  });

  describe('revealVerification', () => {
    it('should reveal a verification successfully', async () => {
      // Arrange
      const claimId = 'test-claim-id';
      const verifierId = 'test-verifier-id';

      // First, submit a commit
      await verificationService.submitCommit(claimId, verifierId);

      // Get the created verification to retrieve nonce
      const verification = await verificationService.getVerifications(claimId);
      expect(verification.length).toBe(1);
      const nonce = verification[0].nonce;

      // Prepare reveal data
      const revealData = {
        verdict: Verdict.TRUE,
        confidence: 0.8,
        evidence: [{
          type: 'url' as const,
          content: 'https://example.com',
          hash: cryptoService.hash('https://example.com'),
          timestamp: new Date().toISOString()
        }]
      };

      // Act
      const reveal = await verificationService.revealVerification(
        claimId,
        verifierId,
        revealData,
        nonce,
        'test-signature'
      );

      // Assert
      expect(reveal).toBeDefined();
      expect(reveal.claimId).toEqual(claimId);
      expect(reveal.verifierId).toEqual(verifierId);
      expect(reveal.verdict).toEqual(revealData.verdict);
      expect(reveal.confidence).toEqual(revealData.confidence);
      expect(reveal.revealed).toEqual(true);
      expect(reveal.revealedAt).toBeDefined();
    });

    it('should handle reveal without prior commit', async () => {
      // Arrange
      const claimId = 'test-claim-id';
      const verifierId = 'test-verifier-id';

      const revealData = {
        verdict: Verdict.FALSE,
        confidence: 0.9,
        evidence: []
      };

      // Act & Assert
      await expect(verificationService.revealVerification(
        claimId,
        verifierId,
        revealData,
        'test-nonce',
        'test-signature'
      )).rejects.toThrow('No verification commit found');
    });

    it('should detect mismatch between commit and reveal', async () => {
      // Arrange
      const claimId = 'test-claim-id';
      const verifierId = 'test-verifier-id';

      // Submit a commit
      await verificationService.submitCommit(claimId, verifierId);

      // Get the created verification to retrieve nonce
      const verification = await verificationService.getVerifications(claimId);
      expect(verification.length).toBe(1);
      const nonce = verification[0].nonce;

      // Prepare reveal data that intentionally differs from what would match the commit
      const mismatchedRevealData = {
        verdict: Verdict.TRUE, // We'll use a different verdict later
        confidence: 0.8,
        evidence: []
      };

      // Act & Assert - Attempting to reveal with different verdict should fail
      await expect(verificationService.revealVerification(
        claimId,
        verifierId,
        {
          ...mismatchedRevealData,
          verdict: Verdict.FALSE, // Different verdict
        },
        nonce,
        'test-signature'
      )).rejects.toThrow('Commit and reveal mismatch');
    });
  });

  describe('calculateConsensus', () => {
    it('should calculate consensus with majority TRUE verdicts', async () => {
      // Arrange - Create multiple verifications with different verdicts
      const claimId = 'consensus-test-claim';
      const verifiers = ['verifier-true-1', 'verifier-true-2', 'verifier-false'];

      // Register each verifier
      for (const verifierWalletId of verifiers) {
        await reputationService.updateVerifierReputation({
          walletId: verifierWalletId,
          reputationScore: 5.0,
          totalVerifications: 10,
          correctVerifications: 9,
          expertiseCategories: [ClaimCategory.OTHER],
          isActive: true,
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        });
      }

      // Submit commits from 3 verifiers
      const commits = [];
      for (const verifierWalletId of verifiers) {
        const commit = await verificationService.submitCommit(claimId, verifierWalletId);
        commits.push(commit);
      }

      // Reveal verifications (2 TRUE, 1 FALSE)
      const trueVerifiers = ['verifier-true-1', 'verifier-true-2'];
      for (let i = 0; i < commits.length; i++) {
        const verifierWalletId = verifiers[i];
        const verification = await verificationService.getVerifications(claimId, verifierWalletId);
        
        const verdict = trueVerifiers.includes(verifierWalletId) 
          ? Verdict.TRUE 
          : Verdict.FALSE;

        await verificationService.revealVerification(
          claimId,
          verifierWalletId,
          { verdict, confidence: 0.8, evidence: [] },
          verification[0].nonce,
          'test-signature'
        );
      }

      // Act
      const consensus = await verificationService.calculateConsensus(claimId);

      // Assert
      expect(consensus).toBeDefined();
      expect(consensus.verdict).toEqual(Verdict.TRUE); // Majority votes TRUE
      expect(consensus.confidence).toBeGreaterThan(0.5); // Should be > 2/3
      expect(consensus.totalVerifiers).toEqual(3);
      expect(consensus.trueVotes).toEqual(2);
      expect(consensus.falseVotes).toEqual(1);
    });
  });
});