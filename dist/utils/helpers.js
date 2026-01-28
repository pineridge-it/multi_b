"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCanonicalHash = void 0;
exports.capitalizeFirst = capitalizeFirst;
exports.generateId = generateId;
exports.normalizeText = normalizeText;
exports.getTimeUntilDeadline = getTimeUntilDeadline;
exports.formatClaimForDisplay = formatClaimForDisplay;
exports.calculateConfidenceInterval = calculateConfidenceInterval;
exports.validateTimeWindow = validateTimeWindow;
exports.calculateStatisticalSignificance = calculateStatisticalSignificance;
const crypto_service_1 = require("../services/crypto.service");
const cryptoService = new crypto_service_1.CryptoService();
/**
 * Re-export generateCanonicalHash as it's commonly used
 */
const generateCanonicalHash = (request) => {
    return cryptoService.generateCanonicalHash(request);
};
exports.generateCanonicalHash = generateCanonicalHash;
/**
 * Utility to capitalize first letter of a string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Utility to generate random ID
 */
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * Sanitize and normalize claim text
 */
function normalizeText(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s]/g, ''); // Remove special characters
}
/**
 * Calculate time until deadline
 */
function getTimeUntilDeadline(deadline) {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    return {
        days: Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))),
        isPast: diffMs <= 0
    };
}
/**
 * Format claim as human-readable text
 */
function formatClaimForDisplay(request) {
    let formatted = '';
    switch (request.type) {
        case 'statistical':
            formatted = `"${request.subject} ${request.predicate} ${request.object}"`;
            break;
        case 'historical':
            formatted = `"${request.subject} ${request.predicate} ${request.object}"`;
            break;
        case 'scientific':
            formatted = `"${request.subject} ${request.predicate} ${request.object}"`;
            break;
        case 'medical':
            formatted = `Medical claim: "${request.subject} ${request.predicate} ${request.object}"`;
            break;
        case 'financial':
            formatted = `Financial claim: "${request.subject} ${request.predicate} ${request.object}"`;
            break;
        case 'product-performance':
            formatted = `Product claim: "${request.subject} ${request.predicate} ${request.object}"`;
            break;
        case 'legal/regulatory':
            formatted = `Legal claim: "${request.subject} ${request.predicate} ${request.object}"`;
            break;
        default:
            formatted = `"${request.subject} ${request.predicate} ${request.object}"`;
    }
    if (request.timeWindow) {
        if (request.timeWindow.start && request.timeWindow.end) {
            formatted += ` between ${request.timeWindow.start.toDateString()} and ${request.timeWindow.end.toDateString()}`;
        }
        else if (request.timeWindow.asOf) {
            formatted += ` as of ${request.timeWindow.asOf.toDateString()}`;
        }
    }
    if (request.jurisdiction) {
        formatted += ` in ${request.jurisdiction}`;
    }
    return formatted;
}
/**
 * Calculate confidence interval for a given confidence level
 */
function calculateConfidenceInterval(mean, confidence, standardError) {
    // Simplified Z-score lookup for normal distribution
    let zScore = 1.96; // For 95% confidence
    if (confidence >= 0.99) {
        zScore = 2.576;
    }
    else if (confidence >= 0.95) {
        zScore = 1.96;
    }
    else if (confidence >= 0.90) {
        zScore = 1.645;
    }
    else if (confidence >= 0.80) {
        zScore = 1.282;
    }
    const margin = zScore * standardError;
    return {
        lower: mean - margin,
        upper: mean + margin
    };
}
/**
 * Validate a time window
 */
function validateTimeWindow(start, end, asOf) {
    // Cannot mix asOf with start/end
    if (asOf && (start || end)) {
        return {
            valid: false,
            error: 'Cannot specify "as of" with a date range'
        };
    }
    // If both start and end are provided, start must be before end
    if (start && end && start >= end) {
        return {
            valid: false,
            error: 'Start date must be before end date'
        };
    }
    // If asOf is provided, it cannot be in the future
    if (asOf && asOf > new Date()) {
        return {
            valid: false,
            error: '"As of" date cannot be in the future'
        };
    }
    // If neither start nor asOf is provided, default to "asOf: now"
    if (!start && !asOf) {
        asOf = new Date();
    }
    return { valid: true };
}
/**
 * Calculate statistical significance test
 */
function calculateStatisticalSignificance(sampleSize, confidence, marginError) {
    // Normal approximation for proportion
    const zValue = getZValue(confidence);
    const currentMOE = zValue * Math.sqrt(0.25 / sampleSize); // Worst-case p(1-p)=0.25
    const requiredSize = Math.ceil(Math.pow(zValue / marginError, 2) * 0.25);
    return {
        significant: sampleSize >= requiredSize,
        requiredSampleSize: requiredSize,
        currentMarginError: currentMOE
    };
}
function getZValue(confidence) {
    if (confidence >= 0.99)
        return 2.576;
    if (confidence >= 0.95)
        return 1.96;
    if (confidence >= 0.90)
        return 1.645;
    if (confidence >= 0.85)
        return 1.44;
    if (confidence >= 0.80)
        return 1.282;
    if (confidence >= 0.70)
        return 1.036;
    return 1.0; // Default
}
