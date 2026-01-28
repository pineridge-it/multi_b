# Project Babbage Documentation

## Table of Contents

1. [Introduction](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
2. [Wallets](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
3. [Apps](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
4. [Baskets & State Management](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
5. [Overlays](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
6. [Contracts](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
7. [Storage](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
8. [Certificates](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
9. [Micropayments](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
10. [Trust](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
11. [Peer-to-Peer Messaging](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)
12. [Developer Guides](https://www.notion.so/Babbage-Docs-244f0760a159804199e1e4f45c45c9b9?pvs=21)

---

## Introduction

These concepts provide solid grounding in wallets, apps, overlays, contracts, storage, certificates, micropayments, and trust within the BSV ecosystem. By reading these, you'll understand the "why" behind each component—how they interact, what design principles guide them, and how they support scalable, secure development.

---

## Wallets

### Overview of Wallets in Project Babbage

A wallet in the BSV Blockchain ecosystem is software that manages your private keys, identity, tokens, and more—serving as the user's command center for all things on the blockchain. Unlike simple cryptocurrency wallets that just receive and send coins, the newest BSV wallets (especially those aligning with BRC-100) go much further. They act as gateways enabling:

### Transaction Creation & Management

- **Spending Authorization**: Your wallet can facilitate the creation and signing of transactions (e.g., with BRC-1), whether you're sending BSV or other tokenized outputs.
- **Basket-Based UTXO Management**: Wallets can group outputs in baskets (BRC-46), making it easy for apps to insert new token outputs or spend them in a secure, permissioned fashion. Think: "Game tokens in a game assets basket," or "loyalty points in a points basket."

### Identity & Certificates

- **Identity Key Management**: The wallet maintains secure identity keys for each user. This lies at the heart of letting you "log in" across many apps without usernames or passwords.
- **Certificate Creation & Revelation**: Under BRC-52 and BRC-53, wallets help create, present, or verify identity certificates (e.g., proving "I have a valid driver's license" or "I'm over 18").
- **Selective Revelation**: You choose which fields to disclose, preserving privacy and letting an application confirm only what's needed (like just the "DOB" from your government-issued certificate).

### Data Encryption & Secure Messaging

- **Encryption/Decryption**: By deriving keys for specific operations (BRC-2), the wallet can encrypt data for a specific recipient.
- **Digital Signatures**: Similarly, the wallet can sign messages, documents, or even microtransactions, verifying your authenticity.
- **HMAC Creation & Verification**: For integrity checks (BRC-56 HMACs), your wallet can produce and verify cryptographic hashes that prove data has not been altered.

### Open, Vendor-Neutral Interface (BRC-100)

The BRC-100 standard defines a consistent API for any application to talk to any wallet—no more one-off integrations. This uniformity covers:

- Getting & listing outputs
- Creating or signing partially built transactions
- Fetching derived public keys from the user (for encryption or token protocols)
- Handling certificates and selective identity revelation
- Managing baskets of tokens & advanced labeling or tagging

### Trust Network & Identity Resolution

BSV wallets respect the user's own trust preferences. You configure who you trust to certify your identity or the identities of others.

If an app says, "Please show me you're a verified pilot," your wallet checks whether your certificates from a certifier you trust (or that the app trusts) are valid, and only then optionally reveals that attribute or field.

### A Real-World Example: Metanet Desktop Wallet

Projects like the Metanet Desktop (open-sourced by the BSV Association) give you a modern wallet that fully embraces these concepts:

- You have baskets for storing tokens.
- You carry identity certificates that you can selectively reveal.
- You can sign, encrypt, or create transactions, all in one place.
- Crucially, it implements the BRC-100 wallet-to-app standard so any developer building on BRC-100 can integrate with it.

### Developer Perspective: Wallet Client from the TypeScript SDK

To help you—and your application—tap into every bit of wallet functionality, the Wallet Client (part of the TypeScript SDK) exposes a simple interface. You can:

- Create actions (transactions) or partially constructed ones for later signing (so apps can gather multiple participants).
- Fetch or spend tokens from a basket.
- Encrypt and decrypt data with ephemeral keys.
- Obtain or verify identity certificates on behalf of the user, referencing their personal trust network.

Behind the scenes, it uses the BRC-100 specification so your code remains portable across any conformant wallet.

---

## Apps

### How apps function in the Project Babbage ecosystem

In the BSV Blockchain ecosystem, an App is more than just a piece of software that uses the BSV blockchain. It follows specific standards for its codebase structure and how it communicates with wallets, deployment metadata, and guides users through permission requests.

### Core Concepts

### Deployment Metadata

Every App should define its deployment metadata in a `deployment-info.json` file. BRC-102 provides a standardized structure so wallets, services, and other tools can quickly parse an App's declared resources and launch configurations (e.g., local dev with LARS, deployment in the cloud with CARS).

### App Manifest and Permissions

Frontends deployed online typically have a `manifest.json` that describes what permissions they require from users. Whether that's the ability to spend a certain amount of satoshis, read certificate fields, or interact with specific baskets of UTXOs, you can structure these permissions systematically. Group Permissions (described by BRC-73) also go here, making it simpler for users to approve or deny.

### Wallet Interaction

Apps talk to wallets using vendor-neutral messaging layers. BRC-100 outlines the unified abstract approach for calling wallet functions like transaction creation or data decryption. Wallets like Metanet Desktop use this standard.

### Overlay Services

Apps can be frontend-only, backend-only, or both. If they have a backend folder, it describes one or more topic managers and lookup services responsible for tracking and managing the tokens it creates on the network.

### Curation of UTXOs and Tokens

Apps often rely on tokens or specialized transaction outputs to enable unique user experiences, like digital goods, loyalty points, etc:

- **Basket Model**: BRC-46 groups outputs into "baskets" so an App can quickly locate or manage only the tokens relevant to its functionality.
- **Advanced Permission Schemes**: For future-proofing and extra security control over digital assets, upcoming standards like BRC-99 let you define specialized "basket IDs" and rules that determine who can spend or view them.

### Why Build on the Metanet?

### User Trust & Simplicity

By implementing a standardized manifest and permission flow, you're fostering trust. Users understand precisely what they're granting, and the wallet can solicit clear, consistent prompts.

### Interoperability & Future-Proofing

Thanks to a standardized approach, your App naturally works across different wallets that follow the same open protocols. As new permission systems evolve, your App can adopt them seamlessly.

### Reduced Development Overhead

No need to tailor separate flows for each wallet or custom lifecycle. By referencing BRC documents, you can code once and cover every compliant wallet integration immediately.

---

## Baskets & State Management

### Learn about baskets and state management in Metanet apps

### What is a "basket"?

In a BRC-100-compatible wallet, a basket is nothing more than a named collection of unspent transaction outputs (UTXOs) that the wallet deliberately tracks on behalf of a user.

The idea originates in BRC-46 "Wallet Transaction Output Tracking (Output Baskets)", which extends the normal transaction-creation flow with a simple extra field:

```json
{
  "outputs": [{
    "script": "<locking-script>",
    "satoshis": 1000,
    "basket": "todo tokens",
    "customInstructions": "{ … }"
  }]
}
•	When the wallet broadcasts this transaction it also stores the resulting output in the named basket.
•	Later, an app can ask for every UTXO that still sits in that basket via a Transaction-Outputs Request.
•	Spending or explicitly removing the output takes it out of the basket.
Think of a basket as the on-chain equivalent of a labelled folder on your computer: you know exactly which files (outputs) are inside, you can hand selective access to other applications, and you can remove items when they are no longer needed.
Why do baskets matter?
Baskets give developers a standard, vendor-neutral way to keep application state on Bitcoin—in pure UTXO form—without building a bespoke database or indexer.
They unlock three major benefits:
Self-contained tokens
•	BRC-45 formalises the idea that an output itself is a token.
•	By grouping related outputs into a basket you implicitly declare: "Every token in here follows the same spending rules."
•	That lets generic software modules reuse the same unlock logic over and over.
User-centred permissions
•	Access to a basket is granted on a per-application basis by the wallet.
•	A budgeting tool may see budget baskets while a game only sees its game items basket—no cross-contamination.
Zero external dependencies
•	As long as the user keeps a BRC-100 wallet, the data lives with them.
•	No third-party indexers, no central servers, no state channels to maintain.
State-Management Models in Metanet Apps
While baskets are perfect for local state, many apps also need collaborative or global coordination. In practice we see three canonical models:
Model	Where is the UTXO kept?	Who can update it?	Typical comms layer
Local	In a basket inside one user's wallet	Only that user	Local wallet — @bsv/sdk's WalletClient
Direct (Peer-to-Peer)	Outputs bounce between two wallets	Exactly the two peers	Message Box — @bsv/p2p's MessageBoxClient
Global (Overlay Service)	Tracked by a network overlay	Many independent parties	Overlay TopicBroadcaster and LookupResolver (BRC-22 family)
1. Local basket example — Personal To-Do List
•	The to-do app asks the wallet to create one output per task, all tagged basket = "todo tokens".
•	At launch it calls Transaction-Outputs Request and renders every UTXO as a task item.
•	When the user checks a task as "done", the app spends the output—removing it from the basket automatically.
•	No other user is involved, so no external coordination is needed.
2. Direct example — Two-player Coin-Flip
•	Alice and Bob each fund a smart-contract output (e.g., an sCrypt "coin flip" script).
•	They exchange transactions through an encrypted message box.
•	Each update produces a new output; ownership alternates until the final spend pays the winner.
•	Because only Alice and Bob need those updates, baskets aren't required—yet the concept of outputs as state still applies.
3. Global example — 3D Model Marketplace
•	Every time a creator lists a model, their wallet emits an output that encodes the listing terms.
•	A dedicated Overlay Service tracks this specific type of marketplace listing outputs across the whole network, maintaining a searchable catalogue.
•	The app lets buyers pull the latest listing UTXOs from the overlay, decode them, and contact the seller for the purchase.
•	Here, the overlay curates a single source of truth yet the state remains on-chain as first-class UTXOs.
Choosing the right model
If your app...	Consider
Needs solo user data that rarely leaves one device	Local basket
Involves two fixed parties negotiating a shared contract	Direct P2P
Must show public or multi-party data, or enforce scarce items	Overlay
You can, of course, mix and match. A game might track player inventory in local baskets, run head-to-head duels through direct channels, and publish matchmaking info via an overlay.
________________________________________
Overlays
Overlays serve as specialized layers on top of the BSV blockchain
Overlay services are an essential piece of BSV's architecture that make it far easier to build scalable applications without needing to index the entire blockchain.
What Are Overlay Services?
Overlay services are specialized application-focused layers that run "on top" of the base BSV network. Each overlay service tracks only the specific transactions or data that are relevant to its own focus (its "topic"), storing and making that data queryable via a standard API.
•	Topic Managers: The code that decides which new transactions get admitted into the overlay's state and which known records get removed or updated. Essentially, this logic filters out everything that's irrelevant to your app.
•	Lookup Services: The code that provides a query endpoint for the data the topic manager has collected. Instead of you scanning the entire blockchain, you simply ask the overlay's "lookup" API for exactly what you need.
By combining these two parts, an overlay service appears to your app as though it's a normal database, but under the hood it remains grounded in the BSV blockchain. All admitted data is backed by Simplified Payment Verification (SPV) to ensure it's genuinely confirmed on-chain.
When Do You Use Overlay Services?
Overlay services come into play any time you want to build an application that needs shared or global state, or that must track particular outputs on the BSV blockchain without scanning it all:
You need to manage on-chain data for many users
If your app deals with tokens, counters, auctions, user entries, or any multi-user state, you can have an overlay track that data so all your users see the same, consistent global view.
You require queries beyond a single user's scope
A user's own wallet can track data that belongs specifically to them, but for a cross-user application (e.g., leaderboards, a market of items, or game states), you need a broader vantage point. An overlay's lookup service can answer global queries so every participant sees "the big picture."
You want strong SPV-backed assurance
Because overlay services rely on real blockchain confirmations and SPV proofs, they provide a verifiable record of transactions, bridging your app logic with unforgeable on-chain data integrity.
You'd prefer not to ingest the entire blockchain
Instead of running a full node or building a custom indexer, overlays let you track precisely the outputs and transactions you care about. This drastically reduces overhead, which matters for large-scale or specialized applications.
Why Are They Helpful?
Scalability
Rather than one node doing all the heavy lifting of scanning the entire blockchain for every possible use case, the workload is split across many overlay services—each focusing on its own topic. This approach scales as BSV's transaction volume grows.
Rapid Development
An overlay service acts like a typical backend microservice. Your front end can talk to it via familiar REST or HTTP-based calls:
•	/submit to send transactions related to your topic.
•	/lookup to retrieve or filter the data your app needs.
Meanwhile, the service automatically filters away everything irrelevant, so you don't have to build a custom index or handle raw blockchain parsing.
Custom Logic and Data
You can implement precisely the topic logic your application needs. For example, if you have a "MeterCounter" app that increments numbers on-chain, you define a topic manager that admits only those "counter" transactions. This custom vantage point makes development far more streamlined—your overlay is effectively a "custom node," but only for your corner of the data.
Distributed Ownership & Public or Private
Multiple overlays can exist to serve different user groups, or to provide redundancy if one goes down. You could keep your overlay private—only you see your data—or opt to run a public overlay that anyone can query. A business might maintain a private overlay for internal data and provide a partial read-only public lookup if that suits their model.
SPV Security
Overlays rely on the base BSV blockchain for proofs of validity. They do not need to become "trusted authorities." Clients can trust the overlay is only storing transactions that actually made it onto the blockchain.
________________________________________
Contracts
Contracts leverage BSV scripting capabilities to define and enforce constraints among parties
Contracts on the BSV Blockchain start with a simple but powerful concept: a token is a piece of value, stored as an unspent transaction output (UTXO) in Bitcoin. By attaching conditions—often written as a locking script—to these tokens, people can start modeling agreements directly on-chain.
UTXOs as Tokens
BSV treats each unspent transaction output (UTXO) like a discrete token. Each token is a slice of value that can be locked and unlocked according to a script. When a UTXO is locked, it effectively contains rules dictating how the value can be spent in the future. These rules can be as simple as "only unlocked by a matching signature" or as elaborate as multi-party Smart Contracts with sophisticated conditions.
Contracts in Terms of UTXOs
Think of a UTXO as the token-with-rules:
•	The token: the actual bits of value (satoshis) you're controlling.
•	The rules (locking script): code that states who can spend this token and under what circumstances.
When people talk about "Smart Contracts," they're talking about these rules as code—sometimes written in a higher-level language like sCrypt, which then compiles down into "byte code" (Bitcoin script) placed in the UTXO.
Two Types of On-Chain Contracts
Multilateral Contracts
These are agreements among specific parties. Each party has some role—perhaps providing different inputs or signatures. For example, imagine two businesses that create a contract output together: the locking script enforces payment conditions, timelines, or other constraints the businesses need to abide by. To spend or "move" that output, they must satisfy the script's rules.
Unilateral Contracts (Bounties or Puzzles)
Sometimes an offer is open to anyone who fulfills certain conditions. A puzzle on the blockchain might say, "Whoever can supply the secret number can claim the funds in this UTXO," or a more practical scenario might be a bug bounty. The script enforces the payoff automatically: if you meet the condition, the network recognizes your right to claim the tokens.
How Contracts Are "Enforced" by the Network
Enforcement is straightforward:
1.	You propose a locking script with your UTXO (the "offer").
2.	Another party (or any party, in the case of a unilateral contract) attempts to satisfy the conditions (the "acceptance").
3.	Some form of "consideration" is involved—usually in the form of satoshis or other digital assets under control.
4.	With "intention to be bound," you've effectively signaled that you want this locking script to matter—so the network sees the final resolution as legitimate.
The blockchain's miners validate that each spending of a UTXO meets the script's rules. If the transaction meets the script requirements, it is accepted onto the chain. If not, the attempted spend is invalid.
Legal Aspects: Not a Replacement, But a Supplement
Legally speaking, a contract often requires:
•	Offer
•	Acceptance
•	Consideration
•	Intention to be bound
Placing logic on the blockchain doesn't let you ignore real-world laws or processes. Actual legal disputes can still arise, and no technology automatically overrides that. Instead, a blockchain contract helps carry out an agreement's terms when all parties willingly follow the chain's rules. It's like a self-checking tool: if you meet the script, it moves forward. If you don't, it cannot.
sCrypt and Other High-Level Tools
On BSV, writing these locking scripts directly in raw Bitcoin script can be cumbersome. That's why tools like sCrypt exist, offering a "smart contract language" that compiles down to the lower-level script. So you can reason about your contract logic in something that looks like TypeScript or JavaScript-like syntax, then let the compiler produce the final script for the blockchain.
For example, you might specify:
•	Which participants can spend the UTXO.
•	How much time must elapse.
•	Conditions under which the contract should "refund" the value, or pay a bounty.
Your sCrypt code becomes the actual puzzle (locking script) in the UTXO, controlling if and how that UTXO is spent.
________________________________________
Storage
How data is stored and retrieved within the BSV ecosystem under Project Babbage
The BSV blockchain isn't just about monetary transactions—it can also power a rich multimedia ecosystem. From images and videos to audio streams, BSV's ability to store references on-chain combined with off-chain delivery can create seamless, censorship-resistant experiences that scale.
Why Multimedia on BSV?
Immutable References
By embedding file hashes on-chain, you ensure media references are permanent and tamper-proof.
Efficient Off-Chain Delivery
Rather than loading large files on-chain (which can be costly and slow), BSV's design encourages storing the actual file off-chain and referencing it via a hash in a UTXO-based overlay network.
Monetization Potential
BSV microtransactions allow you to monetize content easily—users can pay small amounts to stream a video or unlock premium images.
The Universal Hash Resolution Protocol (BRC-26)
BRC-26 describes the Universal Hash Resolution Protocol (UHRP), a framework for content availability advertisement:
Hosts Advertise Availability
Hosts create a special UTXO indicating they store a file at a specific URL.
Users Find Files via Hash
If you have a file's hash, you can discover who's hosting it (using an overlay network) and fetch it from one or multiple sources.
Resilience & Redundancy
Multiple hosts can keep duplicates, so content remains available even if one host goes offline.
This decouples on-chain references (storing only a hash) from actual file hosting, making large multimedia content practical at scale.
Overlay Networks and BRC-22
Multimedia references are typically broadcast to an overlay network, providing an easy way to track UHRP tokens (UTXOs advertising content). BRC-22 describes how overlay nodes maintain these references and can respond to queries about them.
Topic Managers
A "UHRP" topic manager listens for newly minted or spent UTXOs connected to the UHRP protocol prefix.
Lookup Services (BRC-24)
Overlay nodes can also implement BRC-24 to answer queries like "Who's hosting the image with hash <hash>?"</hash>
Synchronized Data
Nodes share and confirm each other's updates, ensuring consistent knowledge of content hosts and availability.
Workflow: Serving a Video via UHRP
1.	Prepare: Encode your video and generate its SHA-256 hash.
2.	Host: Store the file on a server and create a UHRP advertisement UTXO referencing the file's hash (per BRC-26).
3.	Overlay Announcement: Submit that UTXO to an overlay node (topic = UHRP), which records your advertisement.
4.	User Discovery: A user who wants the video can ask the overlay network for hosts of that hash.
5.	Download & Playback: The user's client retrieves the file from your (or another) URL. Optionally, you can integrate micropayments if you want users to pay per second or per megabyte.
________________________________________
Certificates
How Certificates function within Project Babbage
On the Metanet, Certificates provide verifiable proofs of identity or attributes, securely bound to user-controlled keys. They enable cryptographic attestation of facts (such as a user's personal details) while preserving privacy through selective disclosure.
Key Standards
Identity Certificates (BRC-52)
BRC-52 introduces a privacy-centric, open-ended mechanism for linking a user's public keys with specific identity data. Fields in these certificates are individually encrypted, ensuring users decide which pieces of info they disclose.
Certificate Creation & Revelation (BRC-53)
Adding to BRC-52, BRC-53 defines how an application requests that a wallet both generate and prove certificates. It covers the handshake with a certifier, how keys are encrypted, and how partial revelations (i.e., selected fields only) are securely accomplished.
Peer-to-Peer Mutual Authentication (BRC-103)
BRC-103 describes a protocol for two peers to mutually verify each other's identities (and optional attributes). It leverages identity certificates under BRC-52/53 and standardizes the message flow so each party authenticates the other in a symmetrical, secure exchange.
How Certificates Work
Data Ownership & Encryption
A certificate is composed of fields (e.g., "first_name," "city," "profile_picture") individually encrypted with a unique key, so only the certificate holder can decrypt or re-encrypt them for authorized verifiers.
Certificate Signing
A certifier—such as a trusted authority or an automated service—digitally signs the certificate data, guaranteeing that the attributes (once decrypted) are valid and unmodified.
Selective Disclosure
Users retain control over which fields they share. When a verifier requests certain certificate fields, the user's wallet re-encrypts those fields' keys for that verifier only. This is the core of BRC-52's privacy-first design, extended by BRC-53.
Revocation Outpoint
Certificates optionally include an on-chain outpoint that the certifier can spend to revoke a certificate. This real-time blockchain check avoids reliance on off-chain certificate revocation lists.
Workflow Overview
1.	Application Requests: An App (or website, service, etc.) asks the user's wallet (via BRC-53) to create or prove a certificate.
2.	User Consent: The wallet prompts the user to confirm what data fields the App can see.
3.	Certifier Interaction: If creating a new certificate, the wallet contacts the certifier, obtains signatures, and stores the relevant encryption keys.
4.	Final Proof: The wallet supplies the App (or another verifier) with a partially unencrypted certificate (only the allowed fields) and the certifier's signature.
Why Certificates Matter
Privacy & Control
Traditional ID systems often expose unnecessary info. Metanet certificates, in contrast, let users reveal only minimal data, safeguarding sensitive details.
Decentralized Identity
There's no single identity provider that can block or remove your identity. Instead, multiple certifiers can coexist, and you choose whom you trust.
Security & Authenticity
Certificates inherit the cryptographic strength of BSV-based signing. Verifiers can confirm authenticity by checking each certificate's on-chain revocation status.
Interoperability
By adhering to BRC-52, BRC-53, and BRC-103, any certified data can be shared across apps and wallets with consistent, open protocols rather than one-off integrations.
________________________________________
Micropayments
Discusses micropayment capabilities in Project Babbage
Micropayments are very small payment transactions—often just fractions of a cent—which enable business models that would otherwise be infeasible with higher transaction fees or slower settlement times.
Benefits of Micropayments
Unlock Entirely New Markets
Services that charge only a few cents (or even fractions of a cent) per use can cater to users who want to pay strictly for what they consume. Content creators can monetize individual views, listens, or other user interactions directly, without forcing consumers into subscription bundles or ad-dependent models.
Improve User and Creator Incentives
With micropayments, creators receive direct compensation from their audience, rather than solely from advertisers or sponsors. Consumers pay only for content they genuinely want—aligning incentives for producers to focus on high-quality output.
Enable Fine-Grained Pay-Per-Use
IoT devices, pay-per-API-call platforms, or real-time streaming services can charge extremely small amounts for each unit of usage. This opens up new revenue sources for businesses and lowers barriers for customers, as they do not have to commit to large upfront costs.
Reduce Friction
Leveraging the BSV Blockchain's low fees and high throughput, micropayments can be executed swiftly and at scale. This low friction encourages spontaneous payments, immediate tipping, and granular value exchange between peers.
Why BSV Specifically?
The network has a stable protocol and high transaction capacity, allowing fees to remain low even under heavy usage. This makes micropayment services viable at scale, where each transaction can cost far less than one cent. Because BSV's UTXO model and Simplified Payment Verification (SPV) approach allow for lightweight transaction validation, micropayments can be processed efficiently and directly peer-to-peer.
Recommended Developer Tools & Resources
AuthFetch Client (from the @bsv/sdk library)
Streamlines the process of integrating micropayment functionality into web and mobile applications, handling mutual authentication and automatically paying 402 (Payment Required) responses.
Payment Express Middleware
A server-side module built for BSV-based services. It helps backend applications easily respond with appropriate payment details and verify incoming micropayment transactions.
PeerPayClient (from the @bsv/p2p library)
Facilitates direct, peer-to-peer micropayments between users. Perfect for store-and-forward or live communication scenarios where users or devices exchange small, frequent payments in real time.
________________________________________
Trust
How Trust is established in the Project Babbage ecosystem
On the Metanet, every user controls a unique identity key through their BRC-100-compliant wallet. These wallets do far more than just create transactions or encrypt data; they form the backbone of identity on the Metanet. Because user identities do not rely on a platform's authority—no single site or service "owns" an individual's account—users must have some way to verify information shared among themselves. Enter the Metanet Trust Network.
Why the Metanet Trust Network?
Traditional social login approaches centralize our personas in the hands of a large third party (for example, a social media provider). On the Metanet, users are the ones who hold and present the pieces proving who they are—digital certificates that bind their identity key (public key) to attributes like name, social media handle, or email. Instead of trusting a single central authority, each user decides independently which certifiers they trust to validate certain attributes. This you–control–your–data approach confers tremendous freedom but requires a new approach to trust.
Trust Points
Within your wallet's settings:
•	You decide which identity certifiers you want to trust (and how much).
•	Each certifier is assigned a "trust value" in points. The higher the value, the more your wallet prefers that certifier's certificate over others.
•	In effect, you run your own trust score system. The Metanet Trust Network is simply the sum of these individualized trust settings across all participants.
Identity Certificates in Brief
An "identity certificate" is a signed statement from a certifier. For instance:
•	SocialCert might confirm a user's handle on a microblogging platform.
•	IdentiCert could verify a user's legal name with processes akin to a government ID check.
These certificates use BRC-100's standardized functions for issuance, selective revelation, and verification. Users store them in their wallets. Over time, a user might gather many certificates across multiple attributes (phone number, email, business role, legal name, membership in an organization, etc.).
Identity Resolution: Finding the Right Certificates
In day-to-day usage, your wallet calls two crucial methods (available in BRC-100 wallets):
•	discoverByIdentityKey: "Given the public key of another user, which certificates from certifiers I trust can attest to this key's attributes?"
•	discoverByAttributes: "Find me keys that match certain attributes—for instance, users with an email of 'user@example.com' or a verified handle '@someone.'"
Identity Resolution is the process of answering these questions in real time, using your custom Trust Network settings to do it.
Example: Alice Meets Bob
1.	Alice trusts "SocialCert" at 5 points and "IdentiCert" at 8 points in her wallet's settings.
2.	On a marketplace app, Bob lists an item for sale. The app sees Bob's public key, consults Alice's wallet, and runs discoverByIdentityKey(BobKey).
3.	The wallet sees BobKey has a SocialCert certificate verifying "@BobBigIdeas." Because SocialCert is in Alice's trusted list at 5 points, the wallet returns that certificate to the app.
4.	The app can display "@BobBigIdeas (verified by SocialCert)" next to Bob's listings.
5.	For Bob, that means an immediate jump in credibility from Alice's point of view.
Building Your Own Trust Network
Pick Certifiers
In your wallet's settings, you select certifiers you find reliable. Maybe you trust "SocialCert" for social media handles, "IdentiCert" for legal name, "XPhoneCert" for phone verification, etc.
Assign Trust Points
Each certifier gets a numerical trust value. This is fully in your control. You might set:
•	SocialCert: 5 points
•	IdentiCert: 8 points
•	SomeLessKnownCert: 2 points
•	Anyone that you do not trust to 0 points (excluded).
Pool of Certs
Whenever your wallet tries to resolve an identity, it only returns certificates from the certifiers you trust. If multiple certificates apply, the wallet picks the highest scoring solution.
Fine-Tune Over Time
If you find a certifier less reliable than expected, you can lower or remove its trust. The synergy is that you only see identity data from sources you regard as credible.
________________________________________
Peer-to-Peer Messaging
Discusses the architecture and protocols behind peer-to-peer messaging in Project Babbage
On the Metanet, peer-to-peer messaging is a foundation for interactive, real-time communication between users of decentralized apps. Through the combined use of MessageBox Server and MessageBox Client, messages can be delivered instantly over WebSockets while being reliably persisted via HTTP for later acknowledgment and processing.
Key Components
MessageBox Server
Acts as the backbone for messaging by handling HTTP endpoints to send, list, and acknowledge messages. It ensures that even live messages delivered via WebSocket are stored for subsequent retrieval and management.
MessageBox Client
Enables your application to connect to the MessageBox Server over WebSocket for real-time messaging. It supports authentication, live message delivery, and automatic fallback to HTTP if the live channel is unavailable.
PeerPay Integration
By integrating with PeerPay, messaging apps can incorporate micropayment capabilities. This allows for innovative use cases, such as pay-per-message or monetized content delivery, adding an economic dimension to peer-to-peer communication.
How Peer-to-Peer Messaging Works
Initialization & Authentication
The client retrieves its identity key from a BSV-compatible wallet and establishes a WebSocket connection to the MessageBox Server. Authentication ensures that messages are securely associated with verified users.
Real-Time Delivery with Persistence
Messages are sent live via WebSocket for instant communication. Simultaneously, every message is persisted via HTTP on the server, allowing developers to later list, accept, or reject messages.
Payment-Enabled Messaging
With PeerPay, micropayments can be seamlessly integrated into the messaging flow. This creates opportunities for monetized interactions, such as charging for premium messages or content within a chat interface.
Why Peer-to-Peer Messaging Shines on BSV
Ultra-Low Fees & High Scalability
BSV's low transaction fees and large block sizes make it economically viable to transmit small messages and micropayments.
Reliable Real-Time Communication
The hybrid model—leveraging both WebSocket for live updates and HTTP for persistence—ensures that messages are delivered reliably even if temporary connectivity issues occur.
Innovative Business Models
Integrating micropayments with messaging opens the door to new models like pay-per-message, subscription-based interactions, or micro-donations within chat platforms.
Interoperability with BRC Standards
By adhering to open standards such as BRC-100, apps can seamlessly integrate messaging, payments, and identity features into a unified ecosystem.
________________________________________
Developer Guides
Wallet
The Wallet system lets apps create and manage on-chain transactions, keys, and encrypted data through a single WalletClient interface.
This section contains guides for:
•	Building and sending Transactions
•	Requesting and using Keys
•	Handling Encryption and Decryption
•	Signing data and verifying signatures
•	Setting granular Permissions
•	Certificate acquisition and verification
Transactions
Creating a transaction using the WalletClient
The Wallet section of the Project Babbage docs shows how to use the WalletClient in the @bsv/sdk. This first page focuses on building and sending transactions—everything else in the series (keys, encryption, signing, and so on) builds on what you learn here.
Why Transactions Matter
•	A transaction records one or more outputs on the BSV blockchain.
•	Each output says who can spend it next (the locking script) and how much value it carries (the satoshis field).
•	When you spend an output you include it as an input in a new transaction and supply an unlocking script proving you have the right to spend it.
Prerequisites
Before you begin, ensure you have the following:
•	Node.js and npm – Installed on your system (Node v18+ recommended).
•	A Running Instance of Metanet Desktop
•	@bsv/sdk – The Babbage TypeScript SDK, installed via npm: npm install @bsv/sdk.
Step 1 – Connect a WalletClient
import { WalletClient } from '@bsv/sdk';

// Detect and connect to whichever wallet substrate is available on localhost
// (Desktop app, browser extension, etc.).
const wallet = new WalletClient('auto', 'localhost');
The WalletClient handles UTXO discovery, fee estimation, and signing so you can focus on describing what the transaction should do.
Step 2 – Send 1000 sats to a friend
async function simplePayment () {
  const wallet = new WalletClient('auto', 'localhost')

  const token = await wallet.createAction({
    description: 'Pay 1000 sats to Bob',
    outputs: [{
      satoshis: 1000,
      // Pre‑built locking script for demo purposes.
      lockingScript: '2102aaa7a5a2e386840889732be8d8264d42198f116903ed9f8f2cc9763c0e9958acac0e4d7920666972737420746f6b656e0849276d204d6174744630440220187800c3732512ef3d3ccdf741966b45f4251f879ac933160837a03d1c98a420022064c4d3fb3c07b12c47aae5baef7890e996ffa680e32fb8aa678c7f06ff0d37bd6d75',
      outputDescription: 'Payment to Bob'
    }]
  });

  console.log('Broadcast txid:', token.txid);
}
What just happened?:
•	UTXO selection – WalletClient chose one of your unspent outputs worth ≥ 1000 sats (plus fee).
•	Change output – If the funding UTXO was larger than 1000 sats + fee, a change output was automatically added back to your wallet.
•	Fee calculation – The SDK estimated the byte size of the transaction and added an appropriate miner fee.
•	Signing – The wallet produced a signature for every input it selected.
•	Broadcast – The fully-formed raw transaction was pushed to the network and the returned txid logged.
Bob's address can now spend the 1000 sats once the transaction confirms, and your wallet shows the outgoing payment plus any change.
Key Use
Using your wallet's identity key
Why Keys Matter
•	Your identity key is the root public / private keypair that represents you on the BSV network.
•	The public key lets others verify your signatures, lock funds to you, or encrypt data for you.
•	The private key stays inside the wallet; it is used only to sign or decrypt and is never exposed to front-end code or sent off device
In most situations you only need the public key, and WalletClient exposes an easy helper for that: getPublicKey().
getPublicKey() at a Glance
  identityKey: true,    // root identity key (when true, all other args ignored)
  protocolID: [number 0-2, string],  // specify a protocol to reveal the public keys of
  keyID: string,    // specify which specific public key in the protocol you want to access
  counterparty: 'self' | PubKeyHex | 'anyone', // self, anyone, or identity key of another wallet
  forSelf: true    // specify which party's public key is returned
}): Promise<{ publicKey: string }>;
Get Your Identity Key
import { WalletClient } from '@bsv/sdk'
const wallet = new WalletClient('auto', 'localhost');

const { publicKey } = await wallet.getPublicKey({ identityKey: true });

console.log('My identity public key:', publicKey);
Encryption
Encrypting and decrypting data using the WalletClient
Why Encryption?
•	Keeps app data (messages, invoices, configuration files, etc.) private whether it lives on-chain or off-chain.
•	Achieve secure data flows by having the wallet encrypt/decrypt locally; private keys never leave the device.
•	Work with identity keys on both sides, so every operation lines up with the key concepts you learned in the previous guide.
Encrypting to Yourself
const secret = new TextEncoder().encode('hello, future me');

const { ciphertext } = await wallet.encrypt({
  plaintext: Array.from(secret),
  protocolID: [0, 'notes'], // specify the protocol to use
  keyID: 'encrypt-1',    // specify the key that you want to use
  counterparty: 'self'    // using your wallet's identity key
})

console.log('Cipher:', ciphertext);
The wallet derives a shared secret from your identity key and returns an encrypted byte array you can store anywhere.
Decrypting Later
Decryption must use the exact same protocolID, keyID, and corresponding counterparty that were used to encrypt.
const { plaintext } = await wallet.decrypt({
  ciphertext,
  protocolID: [0, 'notes'],
  keyID: 'encrypt-1',
  counterparty: 'self'
});

console.log(new TextDecoder().decode(Uint8Array.from(plaintext))); // → hello, future me
Overlays
Topic Managers
Setting up a backend with a Topic Manager
This deep-dive shows you how to build and wire up a custom Topic Manager for the BSV Overlay Services Engine, using the backend-project-template as your starting point and emulating the behavior of the hello-overlay example.
Why Topic Managers Matter
A Topic Manager listens for broadcasted on-chain events (UTXO creations, spends, etc.) and filters/admits those outputs into named "topics" that your Lookup Service and front-end can query. This separation makes your overlay:
•	Modular and testable
•	Scalable by having processes run independently
•	Easy to extend with new topics
Prerequisites
Before you begin, ensure you have the following:
•	Node.js and Docker
•	LARS & CARS installed and initialized
•	A Metanet client installed and running
•	Git (optional, but recommended)
Lookup Services
Adding a Lookup Service to a Backend
This deep-dive shows you how to build and wire up a custom Lookup Service for the BSV Overlay Services Engine, using the backend-project-template as your starting point and extending the functionality provided by your Topic Manager.
Why Lookup Services Matter
A Lookup Service stores the outputs admitted by your Topic Manager so that front-ends and other clients can query on-chain data efficiently. With it, you can:
•	Persist data from transactions to be used from a frontend application
•	Provide paginated, filtered queries for UTXOs on-chain
•	Enforce access controls and authentication
Storage
Uploading
Uploading files to UHRP storage servers
The StorageUploader from the @bsv/sdk makes it simple to upload files to the Babbage storage server and retrieve a permanent, content-addressed URL known as a UHRP URL.
Prerequisites
Before you begin, ensure you have the following:
•	Node.js and npm – Installed on your system (Node v14+ recommended).
•	BSV Wallet – A working Babbage/BSV wallet setup.
•	@bsv/sdk – The Babbage TypeScript SDK, installed via npm: npm install @bsv/sdk.
•	File for upload - The file you would like to upload the storage server.
Step 1: Set Up Your Wallet
import { WalletClient } from '@bsv/sdk';

const wallet = new WalletClient('auto', 'localhost');
Step 2: Create a StorageUploader Instance
import { StorageUploader } from '@bsv/sdk';

const storageUploader = new StorageUploader({
  storageURL: '<https://nanostore.babbage.systems>',
  wallet
});
Step 3: Prepare Your File
import { readFileSync } from 'fs';

const fileBuffer = readFileSync('path/to/file.png');
const fileData = Array.from(fileBuffer);

const fileObject = {
  data: fileData,    // The file's raw bytes
  type: 'image/png'    // The file's MIME type
};
Step 4: Upload the File
async function uploadExample() {
  try {
    const retentionPeriod = 525600; // Example: ~1 year in minutes

    const result = await storageUploader.publishFile({
      file: fileObject,
      retentionPeriod
    });

    console.log('File published:', result.published);
    console.log('UHRP URL:', result.uhrpURL);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

uploadExample();
Downloading
Downloading files stored on UHRP servers
StorageDownloader is a utility in the @bsv/sdk that allows you to download files from a Babbage storage server using a unique content address (a UHRP URL).
Step 1: Instantiate the StorageDownloader
import { StorageDownloader } from '@bsv/sdk';

// Initialize the StorageDownloader (default is mainnet settings)
const downloader = new StorageDownloader();

// (Optional) If you want to connect to testnet or a local overlay network, use networkPreset:
// const downloader = new StorageDownloader({ networkPreset: 'testnet' });
Step 2: Resolve the UHRP URL to Find Hosts
// The UHRP URL of the file to download (example from a test upload)
const uhrpUrl = 'XUTTCy7KcAn1MdU8SksihCqTnzXc76gbWNXqVMJ5rN1swFTbqbbV';

// Ask the overlay network for hosts that have this content
const hostUrls = await downloader.resolve(uhrpUrl);

console.log('Hosts advertising the file:', hostUrls);
Step 3: Download the File and Verify Integrity
try {
    const result = await downloader.download(uhrpUrl);
    console.log('Download successful!');
    console.log('MIME type:', result.mimeType);
    console.log('Data length (bytes):', result.data.length);

    // Example: If running in Node.js, you could save the file to disk:
    const fs = require('fs');
    fs.writeFileSync('downloaded_file.bin', Buffer.from(result.data));
    console.log('File saved as downloaded_file.bin');
} catch (error) {
    console.error('Download failed:', error);
}
MessageBox
Client
Guide for integrating and using the MessageBox Client
Overview
The MessageBox Client provides an interface for interacting with the MessageBox Server. It supports both real-time messaging via WebSocket and traditional HTTP requests.
Initialization
import { MessageBoxClient } from '@bsv/sdk'
import { WalletClient } from '@bsv/sdk'

const walletClient = new WalletClient({ /* wallet configuration */ })
const messageBoxClient = new MessageBoxClient({ walletClient, enableLogging: false })

// Initialize the connection to fetch identity key and establish WebSocket
await messageBoxClient.initializeConnection()
WebSocket Operations
Joining a Room
await messageBoxClient.joinRoom('payment_inbox')
Listening for Live Messages
await messageBoxClient.listenForLiveMessages({
  messageBox: 'payment_inbox',
  onMessage: (message) => {
    console.log('Received message:', message)
  }
})
Sending Live Messages
const response = await messageBoxClient.sendLiveMessage({
  recipient: '028d37b941208cd6b8a4c28288eda5f2f16c2b3ab0fcb6d13c18b47fe37b971fc1',
  messageBox: 'payment_inbox',
  body: { text: 'Hello, world!' }
})
Server
Guide for running and using a MessageBox Server
Overview
The MessageBox Server relays encrypted messages between peers over HTTP and WebSocket. It supports sending, receiving, and acknowledging messages in a secure, identity-key-based system.
A public instance is hosted at: <https://messagebox.babbage.systems>
Endpoints
POST /sendMessage
Sends a message to a recipient's message box.
•	Auth Required: Yes (sender must be authenticated)
•	Request Body:
{
  "message": {
    "recipient": "<recipientPublicKey>",
    "messageBox": "payment_inbox",
    "messageId": "xyz123",
    "body": "{...}"
  }
}
POST /listMessages
Lists messages for a specific message box belonging to the authenticated user.
•	Auth Required: Yes
•	Request Body:
{
  "messageBox": "payment_inbox"
}
POST /acknowledgeMessage
Acknowledges (and deletes) a list of message IDs, confirming receipt.
•	Auth Required: Yes
•	Request Body:
{
  "messageIds": ["xyz123"]
}
{
  "messageIds": ["xyz123"]
}
PeerPay
Guide for integrating and using the PeerPay Client
Overview
The PeerPay Client extends the functionality of the MessageBox Client to enable peer-to-peer Bitcoin payments via MessageBox. It supports generating secure payment tokens, sending payments (via HTTP or live WebSocket), and handling incoming payment notifications.
Initialization and Configuration
import { PeerPayClient } from '@bsv/sdk'
import { WalletClient } from '@bsv/sdk'

const walletClient = new WalletClient({ /* wallet configuration */ })
const peerPayClient = new PeerPayClient({
  walletClient,
  enableLogging: true
})
Generating a Payment Token
const paymentToken = await peerPayClient.createPaymentToken({
  recipient: '<recipient_identity_key>',
  amount: 1000
})
Sending a Payment
Sending a Payment via HTTP
await peerPayClient.sendPayment({
  recipient: '<recipient_identity_key>',
  amount: 1000
})
Listening for Incoming Payments
await peerPayClient.listenForLivePayments({
  onPayment: (payment) => {
    console.log('Received payment:', payment)
  }
})

Accepting a Payment
const result = await peerPayClient.acceptPayment(incomingPayment)
console.log('Payment accepted:', result)

Conclusion
Project Babbage provides a comprehensive framework for building scalable, secure applications on the BSV blockchain. By leveraging wallets, apps, overlays, contracts, storage, certificates, micropayments, trust networks, and peer-to-peer messaging, developers can create innovative solutions that harness the full power of Bitcoin's original design.
The modular architecture and open standards ensure interoperability, user control, and future-proofing, making it an ideal platform for next-generation blockchain applications.
```
