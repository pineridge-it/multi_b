# TruthMarket Platform

A decentralized fact-verification platform built on the BSV blockchain that incentivizes truthful content through economic mechanisms.

## Overview

TruthMarket allows users to submit claims for verification, where verified participants (verifiers) stake money on the accuracy of those claims. Through a consensus mechanism, the platform determines the most likely outcome and distributes rewards accordingly.

## Features

- **Claim Submission**: Submit factual claims with supporting evidence
- **Verification Marketplace**: Claim discovery and verification by reputation-weighted verifiers
- **Commit-Reveal Voting**: Two-phase voting to prevent collusion and ensure honest verification
- **Reputation System**: Bayesian-updated accurate scoring and domain-specific expertise tracking
- **Economic Incentives**: Micropayments, smart contract escrow, and reputation-based rewards
- **Dispute Resolution**: Multi-stage dispute resolution with bonded appeals
- **BSV Integration**: BRC-100 compatible wallet support and SPV verification

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- BSV wallet compatible with BRC-100

### Installation

```bash
# Clone the repository
git clone https://github.com/truthmarket/platform.git
cd platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Create database
npm run db:migrate

# Run the application
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

### Claim Endpoints

- `POST /api/claims` - Submit a new claim
- `GET /api/claims/:id` - Get claim details
- `GET /api/claims` - Search claims with filters
- `PUT /api/claims/:id/status` - Update claim status (owner only)

### Verification Endpoints

- `POST /api/verifications/commit` - Submit verification commitment
- `POST /api/verifications/reveal` - Reveal verification verdict
- `GET /api/claims/:claimId/verifications` - Get verifications for a claim
- `GET /api/claims/:claimId/consensus` - Get consensus result

## Architecture

The TruthMarket platform follows an event-sourced architecture with these components:

- **API Gateway**: Express.js server handling HTTP requests
- **Services**: Business logic for claims, verification, reputation, and more
- **Database**: SQLite for development, PostgreSQL for production
- **Blockchain Layer**: BSV transaction handling and smart contracts

### Service Layer

- `ClaimService`: Manages claim submission, retrieval, and status updates
- `VerificationService`: Handles commit-reveal voting and consensus calculation
- `ReputationService`: Manages verifier reputation and expertise tracking
- `WalletService`: BSV wallet operations and SPV verification
- `CryptoService`: Hash generation and Merkle tree operations

## Configuration

See `.env.example` for environment variables:

- `PORT`: Server port (default: 3000)
- `DB_DATABASE`: Database path or connection string
- `BSV_NETWORK`: BSV network (testnet/mainnet)
- `MIN_VERIFICATION_STAKE`: Minimum stake required for verification
- `PLATFORM_FEE`: Platform fee percentage (default: 2%)

## Development Phases

1. **Phase 1 (MVP)**: Core claim/verification workflow with consensus engine
2. **Phase 1.5**: Market safety validation with fraud detection
3. **Phase 2**: Automation and release distribution
4. **Phase 3**: Scale optimizations and performance improvements
5. **Phase 4**: Growth initiatives and ecosystem expansion

## Security Considerations

- All off-chain data integrity is protected by cryptographic hashes and Merkle proofs
- Economic incentives are enforced through blockchain-secured smart contracts
- Reputation scores are calculated using Bayesian updating to prevent manipulation
- Evidence submission requires content hash verification to prevent tampering

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Pass all tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.