import { Request, Response } from 'express';
import { ClaimService } from '../services/claim.service';
import { WalletService } from '../services/wallet.service';
import { SubmitClaimRequest, ClaimCategory, ClaimStatus } from '../models/types';

export class ClaimAPI {
  private claimService: ClaimService;
  private walletService: WalletService;

  constructor(claimService: ClaimService, walletService: WalletService) {
    this.claimService = claimService;
    this.walletService = walletService;
  }

  /**
   * Submit a new claim
   */
  async submitClaim(req: Request, res: Response): Promise<void> {
    try {
      // Authenticate request via wallet signature
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }

      const { walletId, signature } = this.extractAuthFromRequest(req);
      if (!walletId || !signature) {
        res.status(401).json({ error: 'Missing wallet ID or signature' });
        return;
      }

      const isValid = await this.walletService.validateSignature(
        JSON.stringify(req.body),
        walletId,
        signature
      );

      if (!isValid) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Validate request
      const requestData: SubmitClaimRequest = req.body;
      const claim = await this.claimService.submitClaim(requestData, walletId);

      // Return result
      res.status(201).json({
        success: true,
        claim: {
          id: claim.id,
          status: claim.status,
          canonicalHash: claim.canonicalHash
        }
      });

      // Queue background tasks:
      // 1. Create escrow transaction for bounty and stake
      // 2. Notify available verifiers
      // 3. Schedule deadline reminder
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific claim
   */
  async getClaim(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      
      if (!claimId) {
        res.status(400).json({ error: 'Claim ID is required' });
        return;
      }

      const claim = await this.claimService.getClaim(claimId);
      
      if (!claim) {
        res.status(404).json({ error: 'Claim not found' });
        return;
      }

      res.status(200).json({
        success: true,
        claim
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve claim'
      });
    }
  }

  /**
   * Search claims with filters
   */
  async searchClaims(req: Request, res: Response): Promise<void> {
    try {
      // Extract query parameters
      const {
        category,
        status,
        submitterWalletId,
        includeResolved = 'false',
        limit = 20,
        offset = 0
      } = req.query;

      // Convert filter values from strings to proper types
      const filters = {
        category: category as ClaimCategory,
        status: status as ClaimStatus,
        submitterWalletId: submitterWalletId as string,
        includeResolved: includeResolved === 'true',
        limit: parseInt(String(limit), 10),
        offset: parseInt(String(offset), 10)
      };

      const claims = await this.claimService.searchClaims(filters);

      res.status(200).json({
        success: true,
        claims,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          count: claims.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get claims nearing deadline
   */
  async getClaimsNearDeadline(req: Request, res: Response): Promise<void> {
    try {
      const { hours = 24 } = req.query;
      const claims = await this.claimService.findClaimsNearDeadline(parseInt(String(hours), 10));

      res.status(200).json({
        success: true,
        claims,
        count: claims.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get claims available for verification (marketplace)
   */
  async getAvailableClaimsForVerification(req: Request, res: Response): Promise<void> {
    try {
      const { category, minBounty, maxBounty, limit = 50 } = req.query;

      const filters: any = {
        limit: parseInt(String(limit), 10)
      };
      if (category) filters.category = category as string;
      if (minBounty !== undefined) filters.minBounty = parseInt(String(minBounty), 10);
      if (maxBounty !== undefined) filters.maxBounty = parseInt(String(maxBounty), 10);

      const claims = await this.claimService.getAvailableClaimsForVerification(filters);

      res.status(200).json({
        success: true,
        claims
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a claim's status
   */
  async updateClaimStatus(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const { status } = req.body;

      if (!claimId) {
        res.status(400).json({ error: 'Claim ID is required' });
        return;
      }

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      // Check if user has permission to change claim status
      const { walletId, signature } = this.extractAuthFromRequest(req);
      const claim = await this.claimService.getClaim(claimId);
      
      if (!claim) {
        res.status(404).json({ error: 'Claim not found' });
        return;
      }

      // Only claim submitter or admin can change status
      if (claim.submitterWalletId !== walletId && !this.isAdmin(walletId)) {
        res.status(403).json({ error: 'Not authorized to change claim status' });
        return;
      }

      await this.claimService.updateClaimStatus(claimId, status);

      res.status(200).json({
        success: true,
        message: 'Claim status updated'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get claims for a specific user
   */
  async getUserClaims(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = this.extractAuthFromRequest(req);
      const { limit = 20, offset = 0 } = req.query;

      const filters = {
        submitterWalletId: walletId,
        limit: parseInt(String(limit), 10),
        offset: parseInt(String(offset), 10)
      };

      const claims = await this.claimService.searchClaims(filters);

      res.status(200).json({
        success: true,
        claims,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          count: claims.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Extract wallet ID and signature from request headers/authorization
   */
  private extractAuthFromRequest(req: Request): { walletId: string; signature: string } {
    // Implementation would extract wallet ID and signature from:
    // 1. Authorization header (Bearer walletId:signature)
    // 2. Custom headers (X-Wallet-ID, X-Signature)
    // 3. Request body (for JSON Web Token)

    // For demonstration, use hardcoded values
    return {
      walletId: req.headers['x-wallet-id'] as string || '',
      signature: req.headers['x-signature'] as string || ''
    };
  }

  /**
   * Check if wallet ID belongs to an admin
   */
  private isAdmin(walletId: string): boolean {
    // Implementation would check against admin wallet IDs
    // In production, this data should be stored securely
    const adminWalletIds = [
      'admin-wallet-1',
      'admin-wallet-2'
      // Add actual admin wallet IDs
    ];
    
    return adminWalletIds.includes(walletId);
  }
}