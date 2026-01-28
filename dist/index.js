"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const claim_controller_1 = require("./api/claim.controller");
const verification_controller_1 = require("./api/verification.controller");
const claim_service_1 = require("./services/claim.service");
const verification_service_1 = require("./services/verification.service");
const wallet_service_1 = require("./services/wallet.service");
const reputation_service_1 = require("./services/reputation.service");
const database_service_1 = require("./services/database.service");
const crypto_service_1 = require("./services/crypto.service");
// Initialize services
const databaseService = new database_service_1.DatabaseService();
const cryptoService = new crypto_service_1.CryptoService();
const walletService = new wallet_service_1.WalletService();
const reputationService = new reputation_service_1.ReputationService(databaseService);
const claimService = new claim_service_1.ClaimService(databaseService, cryptoService);
const verificationService = new verification_service_1.VerificationService(databaseService, cryptoService, walletService, reputationService);
// Initialize APIs
const claimAPI = new claim_controller_1.ClaimAPI(claimService, walletService);
const verificationAPI = new verification_controller_1.VerificationAPI(verificationService, walletService, reputationService);
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
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
    }
    catch (error) {
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
