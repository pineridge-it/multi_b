import express from 'express';
import { ClaimAPI } from './api/claim.controller';
import { VerificationAPI } from './api/verification.controller';
import { ClaimService } from './services/claim.service';
import { VerificationService } from './services/verification.service';
import { WalletService } from './services/wallet.service';
import { ReputationService } from './services/reputation.service';
import { DatabaseService } from './services/database.service';
import { CryptoService } from './services/crypto.service';

// Initialize services
const databaseService = new DatabaseService();
const cryptoService = new CryptoService();
const walletService = new WalletService();
const reputationService = new ReputationService(databaseService);
const claimService = new ClaimService(databaseService, cryptoService);
const verificationService = new VerificationService(databaseService, cryptoService, walletService, reputationService);

// Initialize APIs
const claimAPI = new ClaimAPI(claimService, walletService);
const verificationAPI = new VerificationAPI(verificationService, walletService, reputationService);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Claim routes
app.post('/api/claims', claimAPI.submitClaim.bind(claimAPI));
app.get('/api/claims/:id', claimAPI.getClaim.bind(claimAPI));
app.get('/api/claims', claimAPI.searchClaims.bind(claimAPI));
app.get('/api/claims/near-deadline', claimAPI.getClaimsNearDeadline.bind(claimAPI));
app.get('/api/claims/available-for-verification', claimAPI.getAvailableClaimsForVerification.bind(claimAPI));
app.put('/api/claims/:id/status', claimAPI.updateClaimStatus.bind(claimAPI));
app.get('/api/users/claims', claimAPI.getUserClaims.bind(claimAPI));

// Verification routes
app.post('/api/verifications/commit', verificationAPI.submitCommit.bind(verificationAPI));
app.post('/api/verifications/reveal', verificationAPI.revealVerification.bind(verificationAPI));
app.get('/api/claims/:claimId/verifications', verificationAPI.getVerifications.bind(verificationAPI));
app.get('/api/verifications/history', verificationAPI.getVerificationHistory.bind(verificationAPI));
app.get('/api/claims/:claimId/consensus', verificationAPI.getConsensus.bind(verificationAPI)); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await databaseService.initializeTables();
    console.log('Database initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`TruthMarket API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  databaseService.close();
  process.exit(0);
});

// Start the server
startServer();