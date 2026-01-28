import { SubmitClaimRequest } from '../models/types';
/**
 * Re-export generateCanonicalHash as it's commonly used
 */
export declare const generateCanonicalHash: (request: SubmitClaimRequest) => string;
/**
 * Utility to capitalize first letter of a string
 */
export declare function capitalizeFirst(str: string): string;
/**
 * Utility to generate random ID
 */
export declare function generateId(): string;
/**
 * Sanitize and normalize claim text
 */
export declare function normalizeText(text: string): string;
/**
 * Calculate time until deadline
 */
export declare function getTimeUntilDeadline(deadline: Date): {
    days: number;
    hours: number;
    minutes: number;
    isPast: boolean;
};
/**
 * Format claim as human-readable text
 */
export declare function formatClaimForDisplay(request: SubmitClaimRequest): string;
/**
 * Calculate confidence interval for a given confidence level
 */
export declare function calculateConfidenceInterval(mean: number, confidence: number, standardError: number): {
    lower: number;
    upper: number;
};
/**
 * Validate a time window
 */
export declare function validateTimeWindow(start?: Date, end?: Date, asOf?: Date): {
    valid: boolean;
    error?: string;
};
/**
 * Calculate statistical significance test
 */
export declare function calculateStatisticalSignificance(sampleSize: number, confidence: number, marginError: number): {
    significant: boolean;
    requiredSampleSize: number;
    currentMarginError: number;
};
