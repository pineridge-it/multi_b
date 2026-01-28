"use strict";
/**
 * Core types and schemas for TruthMarket platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verdict = exports.ClaimStatus = exports.ClaimCategory = exports.ClaimType = void 0;
// Enums
var ClaimType;
(function (ClaimType) {
    ClaimType["STATISTICAL"] = "statistical";
    ClaimType["HISTORICAL"] = "historical";
    ClaimType["SCIENTIFIC"] = "scientific";
    ClaimType["MEDICAL"] = "medical";
    ClaimType["FINANCIAL"] = "financial";
    ClaimType["PRODUCT_PERFORMANCE"] = "product-performance";
    ClaimType["LEGAL_REGULATORY"] = "legal/regulatory";
    ClaimType["OTHER"] = "other";
})(ClaimType || (exports.ClaimType = ClaimType = {}));
var ClaimCategory;
(function (ClaimCategory) {
    ClaimCategory["POLITICS"] = "politics";
    ClaimCategory["SCIENCE"] = "science";
    ClaimCategory["BUSINESS"] = "business";
    ClaimCategory["SPORTS"] = "sports";
    ClaimCategory["HEALTH"] = "health";
    ClaimCategory["TECHNOLOGY"] = "technology";
    ClaimCategory["ENVIRONMENT"] = "environment";
    ClaimCategory["OTHER"] = "other";
})(ClaimCategory || (exports.ClaimCategory = ClaimCategory = {}));
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["PENDING"] = "pending";
    ClaimStatus["COMMIT_PHASE"] = "commit-phase";
    ClaimStatus["REVEAL_PHASE"] = "reveal-phase";
    ClaimStatus["CONSENSUS_REACHED"] = "consensus-reached";
    ClaimStatus["FINALIZED"] = "finalized";
    ClaimStatus["DISPUTED"] = "disputed";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
var Verdict;
(function (Verdict) {
    Verdict["TRUE"] = "true";
    Verdict["MOSTLY_TRUE"] = "mostly-true";
    Verdict["MIXED_MISLEADING"] = "mixed/misleading";
    Verdict["MOSTLY_FALSE"] = "mostly-false";
    Verdict["FALSE"] = "false";
    Verdict["UNVERIFIABLE"] = "unverifiable";
    Verdict["NEEDS_MORE_SPECIFICITY"] = "needs-more-specificity";
})(Verdict || (exports.Verdict = Verdict = {}));
