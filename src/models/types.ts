/**
 * Core types and schemas for TruthMarket platform
 */

export interface Claim {
  id: string;
  submitterWalletId: string;
  type: ClaimType;
  subject: string;
  predicate: string;
  object: string;
  canonicalHash: string;
  timeWindow: {
    start?: Date;
    end?: Date;
    asOf?: Date;
  };
  jurisdiction?: string;
  category: ClaimCategory;
  bounty: number; // in satoshis
  stake: number; // in satoshis
  deadline: Date;
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
  sources?: Source[];
}

export interface Verifier {
  id: string;
  walletId: string;
  reputationScore: number;
  expertiseCategories: ClaimCategory[];
  calibratedAccuracy: number;
  verificationHistory: string[]; // Claim IDs
  isActive: boolean;
  createdAt: Date;
}

export interface Verification {
  id: string;
  claimId: string;
  verifierWalletId: string;
  commitHash: string;
  verdict: Verdict;
  confidence: number;
  evidence: Evidence[];
  revealedAt?: Date;
  stake: number;
  timestamp: Date;
}

export interface Evidence {
  id: string;
  contentHash: string;
  url?: string;
  contentType: string;
  timestamp: Date;
  snapshotPointer?: string;
  description: string;
}

export interface ConsensusResult {
  claimId: string;
  verdict: Verdict;
  confidence: number;
  isFinal: boolean;
  finalizedAt: Date;
  participatingVerifiers: string[];
  disputed?: boolean;
}

// Enums
export enum ClaimType {
  STATISTICAL = "statistical",
  HISTORICAL = "historical",
  SCIENTIFIC = "scientific",
  MEDICAL = "medical",
  FINANCIAL = "financial",
  PRODUCT_PERFORMANCE = "product-performance",
  LEGAL_REGULATORY = "legal/regulatory",
  OTHER = "other"
}

export enum ClaimCategory {
  POLITICS = "politics",
  SCIENCE = "science",
  BUSINESS = "business",
  SPORTS = "sports",
  HEALTH = "health",
  TECHNOLOGY = "technology",
  ENVIRONMENT = "environment",
  OTHER = "other"
}

export enum ClaimStatus {
  PENDING = "pending",
  COMMIT_PHASE = "commit-phase",
  REVEAL_PHASE = "reveal-phase",
  CONSENSUS_REACHED = "consensus-reached",
  FINALIZED = "finalized",
  DISPUTED = "disputed"
}

export enum Verdict {
  TRUE = "true",
  MOSTLY_TRUE = "mostly-true",
  MIXED_MISLEADING = "mixed/misleading",
  MOSTLY_FALSE = "mostly-false",
  FALSE = "false",
  UNVERIFIABLE = "unverifiable",
  NEEDS_MORE_SPECIFICITY = "needs-more-specificity"
}

export interface Source {
  id: string;
  url: string;
  title: string;
  contentHash: string;
  credibilityScore?: number;
  timestamp: Date;
}

export interface Dispute {
  id: string;
  claimId: string;
  challengerWalletId: string;
  bond: number; // in satoshis
  reason: string;
  evidence?: Evidence[];
  createdAt: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

// API Request/Response types
export interface SubmitClaimRequest {
  type: ClaimType;
  subject: string;
  predicate: string;
  object: string;
  timeWindow?: {
    start?: Date;
    end?: Date;
    asOf?: Date;
  };
  jurisdiction?: string;
  category: ClaimCategory;
  bounty: number; // in satoshis
  stake: number; // in satoshis
  deadline: Date;
  sources?: Source[];
}

export interface SubmitVerificationRequest {
  claimId: string;
  verdict: Verdict;
  confidence: number;
  evidence?: Evidence[];
}

export interface WalletProof {
  transactionId: string;
  proof: string;
  spvProof?: any; // BSV SPV proof format
}

// TMP (TruthMarket Protocol) types
export interface TMPMessage {
  type: 'claim' | 'verification' | 'commit' | 'verdict' | 'evidence-bundle-root' | 'reputation-attestation';
  payload: any;
  signature: string;
  timestamp: Date;
  signerWalletId: string;
}

export interface TMPClaim {
  claimHash: string;
  submitterWalletId: string;
  claimData: Claim;
  signature: string;
  timestamp: Date;
}

export interface TMPVerification {
  verificationHash: string;
  claimHash: string;
  verifierWalletId: string;
  verdict: Verdict;
  confidence: number;
  signature: string;
  timestamp: Date;
}

export interface TMPCommit {
  commitHash: string;
  claimHash: string;
  verifierWalletId: string;
  commitment: string; // hash of verdict + confidence + evidence bundle
  signature: string;
  timestamp: Date;
}

export interface TMPReveal {
  revealHash: string;
  claimHash: string;
  verifierWalletId: string;
  verdict: Verdict;
  confidence: number;
  evidenceBundle: Evidence[];
  nonce: string;
  signature: string;
  timestamp: Date;
}