import { ClaimService } from '../../src/services/claim.service';
import { DatabaseService } from '../../src/services/database.service';
import { CryptoService } from '../../src/services/crypto.service';
import { ClaimType, ClaimCategory, ClaimStatus } from '../../src/models/types';

describe('ClaimService', () => {
  let claimService: ClaimService;
  let databaseService: DatabaseService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    // Set up in-memory database for tests
    databaseService = new DatabaseService(':memory:');
    await databaseService.initializeTables();
    
    cryptoService = new CryptoService();
    claimService = new ClaimService(databaseService, cryptoService);
  });

  afterEach(async () => {
    // Clean up database after each test
    databaseService.close();
  });

  describe('submitClaim', () => {
    it('should submit a new claim successfully', async () => {
      // Arrange
      const claimData = {
        title: 'Test Claim',
        description: 'This is a test claim',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [
          {
            type: 'url',
            content: 'https://example.com',
            title: 'Example Source'
          }
        ],
        stake: 1000,
        deadlineHours: 24,
        walletId: 'test-wallet-id',
        sources: [{
          url: 'https://example.com',
          title: 'Example Source',
          description: 'Test source description',
          datePublished: new Date().toISOString()
        }]
      };

      // Act
      const result = await claimService.submitClaim(claimData, claimData.walletId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toEqual(ClaimStatus.OPEN);
      expect(result.canonicalHash).toBeDefined();
      expect(result.submitterWalletId).toEqual(claimData.walletId);
      expect(result.stake).toEqual(claimData.stake);
      expect(result.deadline).toBeDefined();
    });

    it('should reject duplicate claims with same content', async () => {
      // Arrange - Create first claim
      const claimData = {
        title: 'Duplicate Test Claim',
        description: 'This is a duplicate test',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 1000,
        deadlineHours: 24,
        walletId: 'test-wallet-id',
        sources: []
      };

      // Act - Create first claim
      await claimService.submitClaim(claimData, claimData.walletId);

      // Assert - Second claim with same content should be rejected
      await expect(claimService.submitClaim(claimData, claimData.walletId))
        .rejects.toThrow('Duplicate claim detected');
    });

    it('should handle minimum stake validation', async () => {
      // Arrange
      const claimData = {
        title: 'Low Stake Claim',
        description: 'Claim with insufficient stake',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 0, // Below minimum
        deadlineHours: 24,
        walletId: 'test-wallet-id',
        sources: []
      };

      // Act & Assert
      await expect(claimService.submitClaim(claimData, claimData.walletId))
        .rejects.toThrow('Minimum stake required');
    });
  });

  describe('getClaim', () => {
    it('should return a claim by ID', async () => {
      // Arrange
      const claimData = {
        title: 'Get Test Claim',
        description: 'Claim for testing getClaim',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 1000,
        deadlineHours: 24,
        walletId: 'test-wallet-id',
        sources: []
      };

      const createdClaim = await claimService.submitClaim(claimData, claimData.walletId);

      // Act
      const retrievedClaim = await claimService.getClaim(createdClaim.id);

      // Assert
      expect(retrievedClaim).toBeDefined();
      expect(retrievedClaim.id).toEqual(createdClaim.id);
      expect(retrievedClaim.title).toEqual(claimData.title);
    });

    it('should return null for non-existent claim', async () => {
      // Act
      const result = await claimService.getClaim('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateClaimStatus', () => {
    it('should update claim status', async () => {
      // Arrange
      const claimData = {
        title: 'Status Test Claim',
        description: 'Claim for testing status update',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 1000,
        deadlineHours: 24,
        walletId: 'test-wallet-id',
        sources: []
      };

      const createdClaim = await claimService.submitClaim(claimData, claimData.walletId);

      // Act
      await claimService.updateClaimStatus(createdClaim.id, ClaimStatus.RESOLVED);

      // Assert
      const updatedClaim = await claimService.getClaim(createdClaim.id);
      expect(updatedClaim.status).toEqual(ClaimStatus.RESOLVED);
    });
  });
});