/**
 * @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server
 * Structured error hierarchy for search failures.
 *
 * @module
 */

/** Categorizes search failures for actionable error messages. */
export enum SearchErrorCode {
    MISSING_API_KEY = "MISSING_API_KEY",
    INVALID_CONFIG = "INVALID_CONFIG",
    NETWORK_ERROR = "NETWORK_ERROR",
    API_ERROR = "API_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    CANCELLED = "CANCELLED",
}

/** Error thrown by search operations. Carries a code for categorization. */
export class SearchError extends Error {
    readonly code: SearchErrorCode;
    readonly statusCode?: number;

    constructor(code: SearchErrorCode, message: string, statusCode?: number) {
        super(message);
        this.name = "SearchError";
        this.code = code;
        this.statusCode = statusCode;
    }
}
