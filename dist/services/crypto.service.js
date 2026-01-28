"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const crypto_1 = require("crypto");
class CryptoService {
    /**
     * Generate canonical hash from claim data
     * Ensures identical claims produce the same hash regardless of formatting
     */
    generateCanonicalHash(request) {
        // Normalize values
        const normalizedRequest = {
            type: request.type,
            subject: request.subject.trim().toLowerCase(),
            predicate: request.predicate.trim().toLowerCase(),
            object: request.object.trim().toLowerCase(),
            timeWindow: request.timeWindow ? {
                start: request.timeWindow.start ? new Date(request.timeWindow.start).toISOString() : null,
                end: request.timeWindow.end ? new Date(request.timeWindow.end).toISOString() : null,
                asOf: request.timeWindow.asOf ? new Date(request.timeWindow.asOf).toISOString() : null
            } : null,
            jurisdiction: request.jurisdiction ? request.jurisdiction.trim().toLowerCase() : null,
            category: request.category
        };
        // Create deterministic string representation
        const serialized = JSON.stringify(normalizedRequest, Object.keys(normalizedRequest).sort());
        // Generate SHA-256 hash
        return (0, crypto_1.createHash)('sha256').update(serialized).digest('hex');
    }
    /**
     * Generate hash for any data
     */
    hash(data) {
        return new Promise((resolve) => {
            const hash = (0, crypto_1.createHash)('sha256').update(data).digest('hex');
            resolve(hash);
        });
    }
    /**
     * Generate Merkle tree from array of items
     */
    generateMerkleTree(items) {
        if (items.length === 0) {
            return { hash: '', left: null, right: null };
        }
        // Create leaf nodes
        const nodes = items.map(item => ({
            hash: (0, crypto_1.createHash)('sha256').update(item).digest('hex'),
            left: null,
            right: null
        }));
        // Build tree
        while (nodes.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const left = nodes[i];
                const right = i + 1 < nodes.length ? nodes[i + 1] : null;
                const combined = right
                    ? left.hash + right.hash
                    : left.hash + left.hash; // Duplicate for odd count
                nextLevel.push({
                    hash: (0, crypto_1.createHash)('sha256').update(combined).digest('hex'),
                    left,
                    right
                });
            }
            nodes.length = 0;
            nodes.push(...nextLevel);
        }
        return nodes[0];
    }
    /**
     * Generate Merkle proof for an item in a tree
     */
    generateMerkleProof(root, targetIndex) {
        const proof = [];
        let currentNode = root;
        let index = targetIndex;
        // Get the tree depth
        const depth = this.getTreeDepth(root);
        // Calculate total leaves (2^depth)
        const totalLeaves = Math.pow(2, depth);
        // Traverse from leaf to root
        for (let level = 0; level < depth; level++) {
            const isRightNode = index % 2 === 1;
            const siblingHash = isRightNode
                ? this.getLeftSiblingHash(currentNode, index)
                : this.getRightSiblingHash(currentNode, index);
            if (siblingHash) {
                proof.push({
                    hash: siblingHash,
                    direction: isRightNode ? 'left' : 'right'
                });
            }
            // Move up the tree
            currentNode = this.getParentNode(root, index);
            index = Math.floor(index / 2);
        }
        return proof.reverse(); // Return from bottom to top
    }
    /**
     * Verify Merkle proof
     */
    verifyMerkleProof(itemHash, rootHash, proof) {
        let currentHash = itemHash;
        for (const p of proof) {
            if (p.direction === 'left') {
                currentHash = (0, crypto_1.createHash)('sha256').update(p.hash + currentHash).digest('hex');
            }
            else {
                currentHash = (0, crypto_1.createHash)('sha256').update(currentHash + p.hash).digest('hex');
            }
        }
        return currentHash === rootHash;
    }
    /**
     * Get the depth of a Merkle tree
     */
    getTreeDepth(node) {
        if (!node.left && !node.right)
            return 0;
        return 1 + Math.max(this.getTreeDepth(node.left), this.getTreeDepth(node.right));
    }
    /**
     * Get hash of left sibling at a specific index
     */
    getLeftSiblingHash(node, index) {
        if (index % 2 === 0 || index === 0)
            return null;
        // Find left sibling
        let currentNode = node;
        let currentIndex = index;
        while (currentIndex % 2 === 1) {
            currentNode = this.getParentNode(node, currentIndex);
            currentIndex = Math.floor(currentIndex / 2);
        }
        return currentNode?.right?.hash || null;
    }
    /**
     * Get hash of right sibling at a specific index
     */
    getRightSiblingHash(node, index) {
        if (index % 2 === 1)
            return null;
        // Find right sibling
        let currentNode = node;
        let currentIndex = index;
        while (currentIndex % 2 === 0 && currentIndex !== 0) {
            currentNode = this.getParentNode(node, currentIndex);
            currentIndex = Math.floor(currentIndex / 2);
        }
        return currentNode?.left?.hash || null;
    }
    /**
     * Get parent node at a specific index
     */
    getParentNode(root, index) {
        if (index === 0)
            return null;
        // This would require building proper index mapping in a real implementation
        // Simplified for demonstration
        return root;
    }
    /**
     * Generate content hash for evidence or source
     */
    generateContentHash(content) {
        return (0, crypto_1.createHash)('sha256').update(content).digest('hex');
    }
    /**
     * Generate BSV-style address from public key
     */
    generateBSVAddress(publicKey) {
        // Simplified version - in production, use proper BSV address generation
        const hash = (0, crypto_1.createHash)('sha256').update(publicKey).digest('hex');
        const ripemd160Hash = (0, crypto_1.createHash)('ripemd160').update(hash).digest('hex');
        return this.base58CheckEncode(Buffer.from(ripemd160Hash, 'hex'), 0x00);
    }
    /**
     * Base58Check encoding
     */
    base58CheckEncode(payload, version) {
        // Simplified version - in production, use proper base58 implementation
        return payload.toString('hex'); // Placeholder
    }
    /**
     * Verify digital signature
     */
    verifySignature(message, signature, publicKey) {
        // Simplified version - in production, use proper BSV-specific signature verification
        try {
            const hash = (0, crypto_1.createHash)('sha256').update(message).digest('hex');
            // In production, verify using actual crypto primitives
            return true; // Placeholder
        }
        catch (error) {
            return false;
        }
    }
}
exports.CryptoService = CryptoService;
