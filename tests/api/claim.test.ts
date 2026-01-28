import request from 'supertest';
import { ClaimAPI } from '../../src/api/claim.controller';
import { ClaimService } from '../../src/services/claim.service';
import { WalletService } from '../../src/services/wallet.service';
import { DatabaseService } from '../../src/services/database.service';
import { CryptoService } from '../../src/services/crypto.service';
import { ClaimType, ClaimCategory } from '../../src/models/types';

// Mock Express app for testing
import express from 'express';

describe('Claim API', () => {
  let app: express.Application;
  let claimService: ClaimService;
  let walletService: WalletService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    // Initialize services
    databaseService = new DatabaseService(':memory:');
    await databaseService.initializeTables();
    
    const cryptoService = new CryptoService();
    walletService = new WalletService();
    claimService = new ClaimService(databaseService, cryptoService);
    
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    
    const claimAPI = new ClaimAPI(claimService, walletService);
    
    // Create get/post handlers
    app.post('/api/claims', claimAPI.submitClaim.bind(claimAPI));
    app.get('/api/claims/:id', claimAPI.getClaim.bind(claimAPI));
    app.get('/api/claims', claimAPI.searchClaims.bind(claimAPI));
    
    // Mock wallet service validation to always succeed for tests
    walletService.validateSignature = jest.fn().mockResolvedValue(true);
  });

  afterEach(async () => {
    databaseService.close();
  });

  describe('POST /api/claims', () => {
    it('should create a new claim successfully', async () => {
      // Arrange
      const claimData = {
        title: 'API Test Claim',
        description: 'This is a test claim submitted via API',
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
        sources: [{
          url: 'https://example.com',
          title: 'Example Source',
          description: 'Test source description',
          datePublished: new Date().toISOString()
        }]
      };

      // Act
      const response = await request(app)
        .post('/api/claims')
        .set('X-Wallet-ID', 'test-wallet-id')
        .set('X-Signature', 'test-signature')
        .send(claimData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.claim).toBeDefined();
      expect(response.body.claim.status).toEqual('open');
      expect(response.body.claim.canonicalHash).toBeDefined();
    });

    it('should reject with invalid signature', async () => {
      // Arrange
      const claimData = {
        title: 'Invalid Signature Claim',
        description: 'Claim with invalid signature',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 1000,
        deadlineHours: 24,
        sources: []
      };

      // Mock wallet service validation to fail
      walletService.validateSignature = jest.fn().mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/claims')
        .set('X-Wallet-ID', 'test-wallet-id')
        .set('X-Signature', 'invalid-signature')
        .send(claimData)
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual('Invalid signature');
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidClaimData = {
        // Missing required fields
        description: 'Incomplete claim data'
      };

      // Act
      const response = await request(app)
        .post('/api/claims')
        .set('X-Wallet-ID', 'test-wallet-id')
        .set('X-Signature', 'test-signature')
        .send(invalidClaimData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/claims/:id', () => {
    it('should return a claim by ID', async () => {
      // Arrange
      const claimData = {
        title: 'Get Test Claim',
        description: 'Claim for testing GET endpoint',
        type: ClaimType.FACT,
        category: ClaimCategory.OTHER,
        evidence: [],
        stake: 1000,
        deadlineHours: 24,
        sources: []
      };

      const createdClaim = await claimService.submitClaim(claimData, 'test-wallet-id');

      // Act
      const response = await request(app)
        .get(`/api/claims/${createdClaim.id}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.claim).toBeDefined();
      expect(response.body.claim.id).toEqual(createdClaim.id);
      expect(response.body.claim.title).toEqual(claimData.title);
    });

    it('should return 404 for non-existent claim', async () => {
      // Act
      const response = await request(app)
        .get('/api/claims/non-existent-id')
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toEqual('Claim not found');
    });
  });

  describe('GET /api/claims', () => {
    it('should return claims search results', async () => {
      // Arrange - Create multiple claims
      for (let i = 0; i < 5; i++) {
        await claimService.submitClaim({
          title: `Search Test Claim ${i}`,
          description: `Claim for testing search endpoint ${i}`,
          type: ClaimType.FACT,
          category: ClaimCategory.OTHER,
          evidence: [],
          stake: 1000,
          deadlineHours: 24,
          sources: []
        }, 'test-wallet-id');
      }

      // Act
      const response = await request(app)
        .get('/api/claims')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.claims).toBeDefined();
      expect(response.body.claims.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toEqual(20);
      expect(response.body.pagination.offset).toEqual(0);
    });
  });
});