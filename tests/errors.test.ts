import { describe, it, expect } from "vitest";
import { SearchError, SearchErrorCode } from "../src/errors.js";

describe("SearchErrorCode", () => {
    it("contains all expected error codes", () => {
        expect(SearchErrorCode.MISSING_API_KEY).toBe("MISSING_API_KEY");
        expect(SearchErrorCode.INVALID_CONFIG).toBe("INVALID_CONFIG");
        expect(SearchErrorCode.NETWORK_ERROR).toBe("NETWORK_ERROR");
        expect(SearchErrorCode.API_ERROR).toBe("API_ERROR");
        expect(SearchErrorCode.RATE_LIMITED).toBe("RATE_LIMITED");
        expect(SearchErrorCode.CANCELLED).toBe("CANCELLED");
    });
});

describe("SearchError", () => {
    it("constructs with code and message", () => {
        const err = new SearchError(SearchErrorCode.MISSING_API_KEY, "No key found");
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(SearchError);
        expect(err.code).toBe(SearchErrorCode.MISSING_API_KEY);
        expect(err.message).toBe("No key found");
        expect(err.statusCode).toBeUndefined();
        expect(err.name).toBe("SearchError");
    });

    it("constructs with statusCode", () => {
        const err = new SearchError(SearchErrorCode.API_ERROR, "Bad request", 400);
        expect(err.statusCode).toBe(400);
    });

    it("is correctly identified by instanceof", () => {
        const err = new SearchError(SearchErrorCode.NETWORK_ERROR, "timeout");
        expect(err instanceof SearchError).toBe(true);
        expect(err instanceof Error).toBe(true);
    });

    it("preserves stack trace", () => {
        const err = new SearchError(SearchErrorCode.CANCELLED, "aborted");
        expect(err.stack).toBeDefined();
        expect(err.stack).toContain("SearchError");
    });
});
