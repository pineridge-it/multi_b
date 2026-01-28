"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationAPI = void 0;
class VerificationAPI {
    constructor(verificationService, walletService, reputationService) {
        this.verificationService = verificationService;
        this.walletService = walletService;
        this.reputationService = reputationService;
    }
    /**
     * Submit verification commitment
     */
    async submitCommit(req, res) {
        try {
            // Authenticate request
            const { walletId, signature } = this.extractAuthFromRequest(req);
            const isValid = await this.walletService.validateSignature(JSON.stringify(req.body), walletId, signature);
            if (!isValid) {
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
            const { claimId } = req.body;
            if (!claimId) {
                res.status(400).json({ error: 'Claim ID is required' });
                return;
            }
            // Get verifier reputation
            const verifier = await this.reputationService.getVerifier(walletId);
            if (!verifier || !verifier.isActive) {
                res.status(403).json({ error: 'Verifier not active or not found' });
                return;
            }
            // Check minimum stake
            if (verifier.reputationScore < 1.0) {
                res.status(402).json({
                    error: 'Insufficient reputation for verification',
                    requiredStake: 5 // Higher stake for low rep verifiers
                });
                return;
            }
            // Submit commit
            const commit = await this.verificationService.submitCommit(claimId, walletId);
            // Create time-locked escrow transaction
            const escrowTransactionId = await this.walletService.createCommitTransaction(walletId, 1, // Minimum stake of 1 satoshi
            claimId, commit.commitHash);
            res.status(201).json({
                success: true,
                commit: {
                    id: commit.commitHash,
                    claimId,
                    escrowTransactionId
                }
            });
            // Queue background tasks:
            // 1. Monitor for reveal phase
            // 2. Notify claim submitter
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Reveal verification verdict
     */
    async revealVerification(req, res) {
        try {
            // Authenticate request
            const { walletId, signature } = this.extractAuthFromRequest(req);
            const isValid = await this.walletService.validateSignature(JSON.stringify(req.body), walletId, signature);
            if (!isValid) {
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
            const { claimId, verdict, confidence, evidence, nonce } = req.body;
            if (!claimId || !verdict || typeof confidence !== 'number' || !nonce) {
                res.status(400).json({
                    error: 'Missing required fields: claimId, verdict, confidence, evidence, nonce'
                });
                return;
            }
            // Get verification service to ensure we're in reveal phase
            const reveal = await this.verificationService.revealVerification(claimId, walletId, { verdict, confidence, evidence }, nonce, signature);
            res.status(201).json({
                success: true,
                reveal: {
                    id: reveal.revealHash,
                    claimId,
                    timestamp: reveal.timestamp
                }
            });
            // Queue background tasks:
            // 1. Add to weighted consensus
            // 2. Check if all verifiers have revealed
            // 3. If threshold reached, calculate consensus
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Get verifications for a claim
     */
    async getVerifications(req, res) {
        try {
            const { claimId } = req.params;
            if (!claimId) {
                res.status(400).json({ error: 'Claim ID is required' });
                return;
            }
            const verifications = await this.verificationService.getVerifications(claimId);
            // Filter out verifications still in commit phase
            const revealedVerifications = verifications.filter(v => v.revealedAt);
            res.status(200).json({
                success: true,
                verifications: revealedVerifications,
                count: revealedVerifications.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Get verification history for a verifier
     */
    async getVerificationHistory(req, res) {
        try {
            const { walletId } = this.extractAuthFromRequest(req);
            const { limit = 20, offset = 0 } = req.query;
            // In a real implementation, would query database
            const history = []; // Placeholder
            res.status(200).json({
                success: true,
                history,
                pagination: {
                    limit: parseInt(String(limit), 10),
                    offset: parseInt(String(offset), 10),
                    count: history.length
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    /**
     * Get consensus result for a claim
     */
    async getConsensus(req, res) {
        try {
            const { claimId } = req.params;
            if (!claimId) {
                res.status(400).json({ error: 'Claim ID is required' });
                return;
            }
            // Get consensus result if available
            const consensus = await this.verificationService.getConsensusResult(claimId);
            if (!consensus) {
                res.status(404).json({ error: 'Consensus not yet reached for this claim' });
                return;
            }
            res.json({
                success: true,
                consensus
            });
        }
        catch (error) {
            console.error('Error getting consensus:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.VerificationAPI = VerificationAPI;
