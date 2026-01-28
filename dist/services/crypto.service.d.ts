import { SubmitClaimRequest } from '../models/types';
export declare class CryptoService {
    /**
     * Generate canonical hash from claim data
     * Ensures identical claims produce the same hash regardless of formatting
     */
    generateCanonicalHash(request: SubmitClaimRequest): string;
    /**
     * Generate hash for any data
     */
    hash(data: string): Promise<string>;
    /**
     * Generate Merkle tree from array of items
     */
    generateMerkleTree(items: string[]): MerkleNode;
    /**
     * Generate Merkle proof for an item in a tree
     */
    generateMerkleProof(root: MerkleNode, targetIndex: number): MerkleProof[];
    /**
     * Verify Merkle proof
     */
    verifyMerkleProof(itemHash: string, rootHash: string, proof: MerkleProof[]): boolean;
    /**
     * Get the depth of a Merkle tree
     */
    private getTreeDepth;
    /**
     * Get hash of left sibling at a specific index
     */
    private getLeftSiblingHash;
    /**
     * Get hash of right sibling at a specific index
     */
    private getRightSiblingHash;
    /**
     * Get parent node at a specific index
     */
    private getParentNode;
    /**
     * Generate content hash for evidence or source
     */
    generateContentHash(content: string): string;
    /**
     * Generate BSV-style address from public key
     */
    generateBSVAddress(publicKey: string): string;
    /**
     * Base58Check encoding
     */
    private base58CheckEncode;
    /**
     * Verify digital signature
     */
    verifySignature(message: string, signature: string, publicKey: string): boolean;
}
export interface MerkleNode {
    hash: string;
    left: MerkleNode | null;
    right: MerkleNode | null;
}
export interface MerkleProof {
    hash: string;
    direction: 'left' | 'right';
}
