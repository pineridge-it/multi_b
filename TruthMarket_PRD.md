# **TruthMarket Product Requirements Document (PRD) — BSV-Native Edition**

## **1. Executive Summary**

### **Product Vision**

TruthMarket creates the world's first economically-driven fact-verification platform where truth has measurable value. By leveraging BSV blockchain's SPV, UTXO-native escrow, and BRC-100 wallet integration, we transform information verification from a cost center into a sustainable, trustless economic activity. Users retain custody of their funds while the platform orchestrates verification and settlement, making accuracy profitable and misinformation expensive.

### **Problem Statement**

* **Information Crisis**: The internet is flooded with unverified claims, misinformation, and subjective opinions presented as facts

* **Centralized Gatekeepers**: Current fact-checking relies on centralized authorities with potential bias and limited scalability

* **No Economic Incentives**: Volunteer-based verification systems suffer from low participation and inconsistent quality

* **Binary Trust Models**: Existing platforms offer all-or-nothing credibility without nuanced reputation systems

* **Custody Risk**: Centralized payment systems require users to trust platforms with their funds

### **Solution Overview**

TruthMarket creates a decentralized marketplace where:

* Users submit factual claims with economic stakes (retained in their own wallets)

* Community verifiers earn micropayments for accurate fact-checking

* Truth emerges through economic consensus rather than authority

* Reputation scores create long-term incentive alignment and are portable across applications

* Integration APIs allow other platforms to access verified information with cryptographic proofs

* All settlement is verifiable peer-to-peer via SPV without requiring trust in indexers or custodians

## **2. Product Goals & Objectives**

### **Primary Goals**

1. **Create Economic Truth Discovery**: Enable claims to be verified through market mechanisms rather than centralized authority

2. **Incentivize Quality Verification**: Reward accurate fact-checkers via claim bounties with payout batching and optional SLA premiums (amounts market-priced)

3. **Build Distributed Trust Network**: Establish reputation-based credibility that spans across applications via portable, signed attestations

4. **Enable Real-Time Fact Checking**: Provide instant verification for time-sensitive claims

5. **SLA-backed Priority**: Optional urgency premiums route claims to higher-availability verifiers and faster settlement paths without altering verdict rules

6. **Non-Custodial Architecture**: Keep user funds in their own BRC-100 wallets; platform orchestrates but never holds user assets

### **Success Metrics**

* **User Engagement**: 1,000+ daily active verifiers within 6 months

* **Economic Activity**: $100+ in daily micropayment volume within 3 months

* **Accuracy Rate**: >85% consensus accuracy on resolved claims (measured via gold-set sampling and arbitration)

* **Platform Integration**: 5+ external apps using TruthMarket API within 12 months

* **API Latency**: p95 <= 200ms for read endpoints; p95 <= 400ms for write endpoints

* **Payout Latency**: Off-chain voucher issuance <= 1s; on-chain batch settlement <= 30m (standard) / <= 5m (SLA premium)

* **SPV Verification**: p95 <= 500ms for presenting spend/confirmation proofs to clients

* **Time-to-Finality**: Median time from submission to finalized verdict (separate from "first provisional result")

* **Dispute Rate**: % of claims escalated/appealed; target thresholds by category

* **Fraud/Collusion Rate**: Detected manipulation incidents per 1,000 claims

* **Verifier Retention**: 4-week verifier retention and expert retention by domain

### **Business Objectives**

* **Revenue Model**: 2% platform fee on all micropayment transactions

* **Network Effects**: Each verified claim increases platform value for all users

* **Data Moat**: Build comprehensive database of verified facts with provable lineage

* **API Licensing**: Generate revenue from external platform integrations

* **Interoperability**: Open TruthMarket Protocol (TMP) enables third-party clients and cross-platform reputation

## **3. Target Users & Use Cases**

### **Primary User Personas**

### **Claim Submitters**

* **Who**: Content creators, journalists, researchers, social media users

* **Motivation**: Want credible verification for their factual claims

* **Pain Points**: Lack of credible verification mechanisms, concern about misinformation accusations

* **Value Proposition**: Pay small amounts (0.10¢) to get credible, timestamped verification with portable proof

### **Verifiers**

* **Who**: Subject matter experts, fact-checking enthusiasts, students, professionals seeking side income

* **Motivation**: Earn micropayments while contributing to information quality

* **Pain Points**: No compensation for expertise, limited opportunities for micro-work

* **Value Proposition**: Earn via claim bounties, build verifiable portable reputation across apps

### **Information Consumers**

* **Who**: General internet users, news readers, researchers, decision makers

* **Motivation**: Want to distinguish verified facts from opinions/misinformation

* **Pain Points**: Difficulty assessing credibility, information overload

* **Value Proposition**: Access to crowdsourced, economically-verified information with cryptographic proofs

### **Platform Integrators**

* **Who**: News sites, social media platforms, educational platforms, research institutions

* **Motivation**: Want to add credibility features without building verification infrastructure

* **Pain Points**: High cost of fact-checking, liability concerns, scalability issues

* **Value Proposition**: API access to real-time verification network with SLA tiers and offline-verifiable proofs

### **Core Use Cases**

### **Use Case 1: Journalist Claim Verification**

* **Scenario**: Sarah, a journalist, publishes an article claiming "City X crime rate decreased 15% last year"

* **Flow**: Submit claim (structured schema) → Pay bounty + stake (from her wallet) → Community verifies against public records → Consensus reached → Sarah receives verification certificate + fact card with SPV proofs

* **Value**: Credible backing for her reporting, shareable proof of fact-checking, offline-verifiable evidence

### **Use Case 2: Social Media Fact-Checking**

* **Scenario**: Viral social media post claims specific COVID-19 statistics

* **Flow**: Platform API auto-submits claim → Expert verifiers check against health department data → False claim flagged → Submitter loses stake → Verifiers rewarded via wallet-signed vouchers

* **Value**: Real-time misinformation detection with economic consequences, verifiable settlement

### **Use Case 3: Academic Citation Verification**

* **Scenario**: Student paper cites specific research findings

* **Flow**: Citation submitted for verification (structured schema) → Academic experts validate against original sources with evidence snapshots → Accuracy confirmed → Citation gets "verified" badge with Merkle inclusion proofs

* **Value**: Enhanced academic integrity with traceable verification lineage, portable reputation for experts

### **Use Case 4: Product Claim Verification**

* **Scenario**: Company claims "Our product is 30% more efficient than competitors"

* **Flow**: Claim submitted with technical documentation (structured schema) → Industry experts evaluate methodology → Consensus determines validity → Result published as fact card with SPV proofs

* **Value**: Consumer protection through independent verification, offline-verifiable evidence

## **4. Feature Requirements**

### **Core Features (MVP)**

### **4.1 Claim Submission System**

* **Claim Input Interface**: Rich text editor supporting links, images, citations

* **Structured Claim Schema (Required)**: Each claim must also be captured in a canonical, machine-readable format:

  * **Claim Type**: {statistical, historical, scientific, medical, financial, product-performance, legal/regulatory, other}

  * **Subject / Predicate / Object**: Normalized triple (or template) with controlled vocabulary where possible

  * **Canonicalization Rules**: Specify normalization of units, number formats, timezone handling, and entity identifiers

  * **Deterministic Serialization**: Deterministic JSON serialization for hashing, signing, and deduplication

  * **Time Window**: Start/end (or "as of" timestamp) to prevent "true then vs true now" confusion

  * **Jurisdiction/Location**: Optional but required for location-dependent claims

  * **Units & Measurement Definition**: Required for numeric claims (what exactly is being measured and how)

  * **Falsifiability Check**: Must be verifiable in principle; otherwise routed to "Unverifiable" workflow

* **Claim Versioning**: Claims are immutable once submitted; edits create a new version linked to the prior version

* **Deduplication**: System computes a canonical hash from the deterministic schema; if a materially identical claim exists, users can sponsor/re-open it instead of duplicating; near-duplicate detection uses controlled vocabulary and normalized units

* **Category Selection**: Predefined categories (Politics, Science, Business, Sports, etc.)

* **Source Attachment**: Ability to attach supporting documents/links

* **Stake Setting**: User-configurable stake amount (minimum 0.10¢) held in user's wallet

* **Deadline Setting**: Verification time window (24h-7days)

### **4.2 Verification Marketplace**

* **Claim Discovery**: Browse pending claims by category, stake amount, deadline

* **Verification Interface**: Submit verdict with supporting evidence using a standardized taxonomy:

  * **Verdicts**: {True, Mostly True, Mixed/Misleading, Mostly False, False, Unverifiable, Needs More Specificity}

  * **Confidence**: 0.0–1.0 with calibration requirements per verifier reputation tier

  * **Claim-Specific Fields**: For numeric claims, require computed value + method + source snapshot

* **Evidence Submission**: Text reasoning + supporting links/documents with mandatory provenance:

  * **Content Hash** of each cited artifact (page/document/media)

  * **Snapshot Pointer** (content-addressed reference) + retrieval instructions; mirrors encouraged to improve availability

  * **Timestamp + Verifier Signature** over the evidence bundle

  * **Bundle Merkle Root**: Evidence items are organized into a Merkle tree; the root is included in the commit payload and periodically anchored on-chain

  * **Inclusion Proofs**: Final verdicts return Merkle inclusion proofs for all referenced artifacts

* **Verifier Staking**: Required stake (minimum 0.05¢) held in verifier's wallet to prevent spam

* **Real-time Updates**: Live feed of new claims and verification activities

### **4.3 Consensus Engine**

* **Voting Period**: Configurable time window for verification submissions

* **Commit–Reveal Voting (Anti-Herding)**:

  * **Commit Phase**: Verifiers submit a hash(commit) of {verdict, confidence, evidence bundle}

  * **Reveal Phase**: Verifiers reveal the payload; unrevealed commits are penalized

  * **No Live Tallies**: During commit, do not display partial results

  * **Anchored Commits (Optional)**: Commit hashes can be referenced in a minimal on-chain output or batched anchor to prove existence and timestamp, preventing equivocation across sessions

  * **Nonces and Binding**: Commits include a random nonce and are bound to a specific claim ID and verifier key to prevent grinding and replay

* **Consensus Algorithm**: Reputation-weighted majority with minimum threshold

* **Dispute Resolution (Bonded, Multi-Stage)**:

  * **Challenge Window** after provisional verdict (e.g., 6–24h depending on SLA)

  * Challenger posts a **bond** (held in their wallet); frivolous challenges lose the bond

  * Escalation increases quorum size and reputation thresholds

  * Finality: verdict becomes immutable after finalization unless a new claim version is created

  * **On-Chain Enforcement**: Stakes, bonds, and payouts are governed by UTXO spend conditions with time-locked refunds for unspent paths

  * **Slashing**: Non-reveals and proven manipulation trigger on-chain slash paths redeemable by the protocol key during the dispute window

* **Automated Payouts**: Smart contract execution of rewards/penalties; verifier rewards may accrue as off-chain payout vouchers/state-channel updates with subsequent on-chain settlement

* **Result Publication**: Final verdict + calibrated confidence + evidence summary + "what would change this verdict" criteria

### **4.4 Reputation System**

* **Accuracy Tracking (Bayesian)**: Bayesian-updated accuracy with uncertainty bounds (new users aren't over-weighted)

* **Expertise Categories**: Domain-specific reputation scores

* **Verification History**: Complete audit trail of past activities

* **Reputation Stakes**: Higher rep = higher reward multipliers

* **Decay Mechanism**: Reputation requires ongoing participation to maintain

* **Calibration Score**: Measures how well a verifier's confidence matches outcomes over time

* **Fraud/Collusion Signals**: Automated down-weighting + investigation triggers for correlated voting patterns

* **Wallet-Native Identity**: Verifier identities are controlled by their BRC-100 wallets; long-lived keys can rotate via wallet-managed attestations

* **Portable Attestations**: Reputation snapshots are emitted as signed attestations (content-hashed and periodically anchored) for use across applications

* **Selective Disclosure**: Privacy-preserving mode that publishes scores and proofs without exposing underlying PII; optional enterprise KYC per SLA tier

* **Wallet-level Independence Checks**: Timing, key reuse across claims, correlated commit windows, and correlated funding patterns across wallets

* **Minority-correct Bonus**: Small reward uplift for early correct outliers (commit timestamps anchored), bounded to avoid gaming

* **Slashing Triggers**: Demonstrable vote buying/bribery patterns (e.g., coordinated non-reveal with on-chain incentives) can trigger slashing during the dispute window

### **4.5 Economic Engine**

* **Micropayment Processing**: Non-custodial BRC-100 wallet integration with SPV verification and payout batching (no internal custodial ledger)

* **Smart Contract Execution**: Automated stake collection and payout distribution via UTXO spend conditions

* **Fee Structure**: Transparent 2% platform fee on all micropayment transactions

* **Earnings Dashboard**: Real-time tracking of user earnings and payouts

* **Withdrawal System**: Convert satoshis to preferred currency via integrated exchange partners

* **Bounty Model (Replace Fixed Rates)**:

  * Submitter posts a **bounty** (base + optional urgency premium) from their wallet

  * Verifier rewards split by: correctness, reputation, evidence quality, and timeliness

  * **Priority Routing**: Urgency premiums allocate more watcher capacity (notifications, faster commit windows, faster batch settlement)

  * Payouts settle continuously as wallet-signed vouchers; on-chain payouts occur in batches or on withdrawal with SPV proofs provided to users

  * **Refund Paths**: Unspent bounty UTXOs return to submitter after time-lock expiry or if consensus fails to finalize

### **Advanced Features (Post-MVP)**

### **4.6 AI-Assisted Verification**

* **Claim Preprocessing**: Automatic source checking and initial credibility assessment

* **Evidence Validation**: AI cross-referencing against known reliable sources

* **Consensus Prediction**: ML models to predict likely verification outcomes

* **Expert Routing**: Intelligent matching of claims to relevant domain experts

### **4.7 Integration & API**

* **REST API (Versioned)**: Full programmatic access to claim submission and verification with versioning guarantees

* **Open Protocol (TMP)**: Canonical, deterministic encoding for Claims, Verifications, Commits, Verdicts, EvidenceBundleRoot, and ReputationAttestation

  * Each message type has a stable schema; IDs are content hashes

  * Protocol messages are signed by wallet keys and can be transported via HTTP or other peer-to-peer channels

  * Reference implementations and conformance tests ensure compatibility

* **Auth**: Wallet-signed requests (BRC-100) with short-lived capability tokens issued via challenge–response; API keys optional for server-to-server integrations

* **Rate Limits & Quotas**: Tiered limits with clear error semantics

* **Micropayment Gating (Optional)**: Pay-per-call via BSV micropayments with SPV proofs to throttle abuse and enable premium performance tiers

* **Idempotency**: Required for claim submission and payment-related endpoints

* **Webhook System (Signed)**: Real-time notifications with signature verification + retry/backoff rules

  * Webhook bodies include payment SPV proofs when financial events occur for end-to-end verifiability

* **Browser Extension**: One-click verification for claims encountered on any website

* **Social Media Integration**: Automatic claim detection and verification prompts

* **Proof-rich Responses**: Endpoints that mutate funds or state also return SPV proofs, evidence Merkle inclusion proofs, and the current anchored root to minimize trust and enable offline verification

### **4.8 Advanced Analytics**

* **Truth Trends**: Dashboard showing verification patterns by topic/time

* **Verifier Performance**: Detailed analytics on accuracy, speed, expertise areas

* **Claim Analysis**: Insights into types of claims most frequently disputed

* **Platform Health**: Network effects metrics and economic flow analysis

### **4.9 Community Features**

* **Verifier Profiles**: Public profiles showcasing expertise and track record

* **Discussion Threads**: Collaborative discussion around complex claims

* **Expert Certification**: Verified credentials for professional fact-checkers

* **Mentorship Program**: Experienced verifiers training newcomers

* **Fact Cards**: Auto-generated shareable "fact cards" (verdict, confidence, key evidence, timestamp, claim hash)

  * Fact cards include: claim hash, verdict signature, evidence Merkle inclusion proofs, and SPV proofs of escrow funding and final payouts

  * Machine-verifiable payload and QR link for wallet-native verification

* **Claim Sponsorship**: Users/integrators can add bounty to an existing claim to increase quorum/confidence or re-open as a new version

## **5. Technical Requirements**

### **5.0 System Architecture (Required)**

* **Off-chain Core (Performance Path)**:

  * API Gateway (auth, rate limits, idempotency)

  * Claim Service (schema validation, dedup, versioning)

  * Verification Service (commit–reveal handling, evidence bundle storage)

  * Consensus Service (tallying, thresholds, dispute workflow)

  * Reputation Service (scoring, calibration, fraud signals)

  * Wallet Orchestrator (BRC-100 sessioning, SPV verification, payout batching via channels/vouchers; no user-funds custody)

  * Event Bus / Queue (verification deadlines, payout jobs, notifications)

  * Read-optimized Index (search, feeds, dashboards)

  * Cache layer (hot claims, user profiles, API responses)

* **On-chain (Settlement & Audit Path)**:

  * UTXO-backed escrow and payouts with time-locked refund paths

  * Periodic anchoring of off-chain state hashes (claims, verdicts, evidence Merkle roots)

  * Optional per-claim state channels/payout vouchers to aggregate verifier rewards off-chain with later settlement

  * Commit–reveal anchors: commit hashes optionally embedded on-chain to prevent equivocation

  * Anchor cadence: target every N blocks (configurable per SLA tier); emergency/manual anchors permitted during high-importance disputes

  * Retention policy: retain all event logs required to reconstruct state roots indefinitely; provide export tools for third-party mirrors

* **Design Principles**:

  * Event-sourced state changes for auditability

  * Idempotent writes for payment safety

  * Deterministic consensus computation (replayable from events)

  * SPV-first architecture: all settlement proofs are verifiable peer-to-peer without indexers

  * Vendor-neutral wallet layer via BRC-100 to ensure interoperability and portability

### **5.1 Performance Requirements**

* **API Latency**: p95 <= 200ms for read endpoints; p95 <= 400ms for write endpoints

* **Payout Latency**: Off-chain voucher issuance <= 1s; on-chain batch settlement <= 30m (standard) / <= 5m (SLA premium)

* **SPV Verification**: p95 <= 500ms for presenting spend/confirmation proofs to clients

* **Throughput**: Support 1000+ concurrent verification sessions

* **Uptime**: 99.9% availability during peak hours

* **Scalability**: Architecture supports 10x user growth without major refactoring

### **5.1.1 Reliability & Observability (Required)**

* **SLOs**: Define SLOs for API latency, claim state propagation, payout settlement, and webhook delivery

* **Error Budgets**: Release gating tied to error budget burn

* **Tracing/Logging**: End-to-end distributed tracing + audit logs for all state transitions

* **Degraded Modes**: Read-only mode if payment rail is impaired; queue writes for later settlement

### **5.2 Security Requirements**

* **Data Integrity**: All claims and verifications cryptographically signed

* **Evidence Integrity**: Evidence bundles must be content-hashed and immutable once submitted

* **Anti-Link-Rot**: Store snapshot pointers for all external citations used in final verdict summaries

* **Privacy Protection**: User identities protected while maintaining accountability; wallet keys are the primary identity

* **Fraud Prevention**: Sybil attack resistance through economic stakes and wallet-level independence checks

* **Audit Trail**: Complete immutable record of all verification activities, replayable from event logs

* **Non-Custody**: Platform never holds user funds; all escrow is UTXO-backed and time-locked

### **5.3 Integration Requirements**

* **Wallet Compatibility**: Support for BRC-100 compliant BSV wallets

* **Cross-Platform**: Web app, mobile responsive, API access

* **Third-Party APIs**: Integration with fact-checking databases and academic sources

* **Export Capabilities**: Data export in standard formats (JSON, CSV)

* **SPV Proof Export**: Clients can export SPV proofs for offline verification

### **5.4 Regulatory Compliance**

* **Data Protection**: GDPR/CCPA compliance for user data handling

* **Financial Regulations**: Compliance with micropayment regulations

* **Content Moderation**: Tools to prevent abuse while maintaining neutrality

* **Sensitive-Claim Handling**:

  * Additional safeguards for claims involving identifiable private individuals, medical guidance, or financial advice

  * Policy-driven claim rejection categories (doxxing, harassment, direct incitement)

  * Clear disclaimers on "verification" vs "advice"

* **International Access**: Support for global user base with localization

## **6. User Experience Requirements**

### **6.1 Usability Goals**

* **Onboarding**: New users can submit first claim within 3 minutes (including wallet connection)

* **Learning Curve**: Verification interface intuitive for first-time users

* **Mobile Experience**: Full functionality available on mobile devices

* **Accessibility**: WCAG 2.1 AA compliance for inclusive access

### **6.2 Interface Requirements**

* **Clean Design**: Minimal, distraction-free interface focusing on content

* **Real-time Feedback**: Immediate confirmation of all user actions

* **Progress Indicators**: Clear status tracking for claims and verifications

* **Error Handling**: Helpful error messages with suggested actions

* **Proof Visibility**: Users can inspect SPV proofs and Merkle inclusion proofs for any claim or payout

### **6.3 Trust & Transparency**

* **Verification Lineage**: Complete audit trail for every verification decision

* **Algorithm Transparency**: Clear explanation of consensus and reputation calculations

* **Economic Clarity**: Transparent fee structure and payout calculations

* **Source Attribution**: Proper citation and attribution for all evidence

* **Cryptographic Verification**: Users can verify claims and payouts offline using SPV proofs

## **7. Business Requirements**

### **7.1 Revenue Model**

* **Platform Fees**: 2% fee on all micropayment transactions

* **API Licensing**: Tiered pricing for high-volume commercial integrations

* **Premium Features**: Enhanced analytics and priority verification for enterprise users

* **Certification Services**: Verified expert badge program with certification fees

* **SLA Tiers**: Premium settlement speed and routing for enterprise integrators

### **7.2 Growth Strategy**

* **Network Effects**: Each verified claim increases platform value for all users

* **Fact Cards**: Auto-generated shareable "fact cards" with SPV proofs for viral loops

* **Claim Sponsorship**: Users/integrators can add bounty to an existing claim to increase quorum/confidence or re-open as a new version

* **Partnership Program**: Integration partnerships with news/educational platforms

* **Expert Recruitment**: Direct outreach to domain experts and fact-checkers

* **Portable Reputation**: Reputation attestations adopted by integrators drive cross-platform value

### **7.3 Competitive Differentiation**

* **Economic Incentives**: Only platform that pays verifiers for accurate work

* **Real-time Verification**: Faster than traditional fact-checking organizations

* **Decentralized Trust**: No single point of failure or bias; non-custodial architecture

* **Granular Reputation**: Nuanced credibility scoring vs binary trust models

* **Verifiable Proofs**: Offline-verifiable SPV and Merkle proofs; no trust in platform required

* **Interoperability**: Open TruthMarket Protocol enables third-party clients and cross-platform reputation

## **8. Risk Assessment & Mitigation**

### **8.1 Technical Risks**

* **Blockchain Dependency**: Risk mitigated through BSV stability and multiple overlay providers

* **Scalability Challenges**: Addressed through modular architecture, caching layers, and state channels

* **Integration Complexity**: Managed through comprehensive API documentation, SDKs, and TMP reference implementations

* **SPV Proof Verification**: Clients must validate proofs; provide clear error messages and fallback to trusted indexers if needed

### **8.2 Economic Risks**

* **Market Manipulation**: Prevented through reputation staking, consensus thresholds, commit–reveal voting, and wallet-level independence checks

* **Economic Attacks**: Mitigated through progressive stake requirements, reputation decay, collusion detection, and slashing

* **Low Adoption**: Addressed through expert recruitment, partnership programs, and portable reputation incentives

### **8.3 Regulatory Risks**

* **Content Liability**: Positioned as neutral platform with community-driven verification

* **Financial Regulations**: Compliance through proper micropayment handling, reporting, and non-custody model

* **International Restrictions**: Designed for global access with local compliance adaptations

## **9. Success Criteria & KPIs**

### **9.1 User Adoption**

* **Month 1**: 100 registered users, 50 verified claims

* **Month 3**: 1,000 registered users, 500 daily verifications

* **Month 6**: 5,000 registered users, 85% accuracy rate

* **Month 12**: 20,000 registered users, 5 platform integrations

### **9.2 Economic Metrics**

* **Month 1**: $10 daily transaction volume

* **Month 3**: $100 daily transaction volume

* **Month 6**: $500 daily transaction volume

* **Month 12**: $2,000 daily transaction volume

### **9.3 Quality Metrics**

* **Verification Accuracy**: >85% consensus accuracy maintained (measured via gold-set sampling and arbitration)

* **API Latency**: p95 <= 200ms for read endpoints; p95 <= 400ms for write endpoints

* **Payout Latency**: Off-chain voucher issuance <= 1s; on-chain batch settlement <= 30m (standard) / <= 5m (SLA premium)

* **SPV Verification**: p95 <= 500ms for presenting spend/confirmation proofs to clients

* **Time-to-Finality**: Median time from submission to finalized verdict

* **Dispute Rate**: % of claims escalated/appealed; target thresholds by category

* **Fraud/Collusion Rate**: Detected manipulation incidents per 1,000 claims

* **User Satisfaction**: >4.5/5 average rating from both submitters and verifiers

* **Expert Participation**: >30% of verifications from credentialed experts

* **Verifier Retention**: 4-week verifier retention and expert retention by domain

## **10. Development Phases**

### **Phase 1: MVP**

* Core claim submission and verification with structured schema

* Basic Bayesian reputation system

* Manual consensus determination (deterministic and replayable)

* Simple web interface

* Commit–reveal voting mechanism

* Evidence snapshot and content-hashing

* BRC-100 wallet connect and wallet-signed API requests

* SPV verification for basic payment flows (stakes, bounties)

### **Phase 1.5: Market Safety Validation (Required)**

* Incentive simulation (spam, collusion, bribery, herding) and parameter tuning

* Seeded "gold set" claims for calibration and early reputation grounding

* Threat modeling and security review of signing, escrow, and payout flows

* Bonded dispute resolution testing

* Dry-run of anchored commits and evidence Merkle roots

### **Phase 2: Automation**

* Smart contract integration

* Automated payouts with batching and payout vouchers/state channels

* SPV overlay enhancements (peer watchers for fast proof propagation)

* Mobile responsive design

* Signed webhook system

* API versioning and idempotency

* TMP reference implementation and conformance tests

### **Phase 3: Scale**

* API development (auth, rate limits, quotas)

* Performance optimization and observability (SLOs, tracing, error budgets)

* Advanced analytics

* First platform integrations

* Fact cards and claim sponsorship

* Enterprise SLA tiers with priority routing and settlement

### **Phase 4: Growth**

* AI-assisted features

* Expert certification program

* International expansion

* Enterprise partnerships

* Advanced collusion detection

* Portable reputation attestations adopted by integrators

---

## **Closing Notes**

This BSV-native edition of TruthMarket leverages the protocol's core strengths:

* **SPV-first architecture** enables peer-to-peer verification without indexer trust

* **UTXO-native escrow** with time-locked refunds provides non-custodial, auditable settlement

* **BRC-100 wallet integration** ensures vendor-neutral, portable identity and reputation

* **Deterministic consensus** and event sourcing enable offline verification and third-party audits

* **Open TruthMarket Protocol (TMP)** creates network effects and prevents platform lock-in

The platform transforms fact-checking from a cost center into a sustainable economic activity, creating a new paradigm for information verification in the digital age—one where truth is verifiable, portable, and economically rewarded.
