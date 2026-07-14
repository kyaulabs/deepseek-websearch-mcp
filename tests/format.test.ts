import { describe, it, expect } from "vitest";
import { formatResults, formatError } from "../src/format.js";
import type { SearchResponse } from "../src/types.js";
import { SearchError, SearchErrorCode } from "../src/errors.js";

describe("formatResults", () => {
    it("returns no-results message when both results and answer are empty", () => {
        const response: SearchResponse = { results: [], textAnswer: "" };
        const output = formatResults("test query", response);
        expect(output).toContain("no results");
        expect(output).toContain("test query");
    });

    it("formats text answer with heading when no heading present", () => {
        const response: SearchResponse = {
            results: [],
            textAnswer: "Some answer text.",
        };
        const output = formatResults("query", response);
        expect(output).toContain("## Search Results Summary");
        expect(output).toContain("Some answer text.");
    });

    it("preserves existing markdown heading in text answer", () => {
        const response: SearchResponse = {
            results: [],
            textAnswer: "## Custom Heading\n\nDetails here.",
        };
        const output = formatResults("query", response);
        expect(output).toContain("## Custom Heading");
        expect(output).not.toContain("## Search Results Summary");
    });

    it("formats source list with numbered entries", () => {
        const response: SearchResponse = {
            results: [
                { title: "First Source", url: "https://example.com/1", pageAge: "2025-07-01" },
                { title: "Second Source", url: "https://example.com/2", pageAge: null },
            ],
            textAnswer: "Answer text.",
        };
        const output = formatResults("query", response);
        expect(output).toContain("### Sources (2):");
        expect(output).toContain("[First Source](https://example.com/1)");
        expect(output).toContain("[Second Source](https://example.com/2)");
    });

    it("includes page_age as italic when present", () => {
        const response: SearchResponse = {
            results: [
                { title: "Source", url: "https://example.com", pageAge: "2025-07-01" },
            ],
            textAnswer: "",
        };
        const output = formatResults("query", response);
        expect(output).toContain("*2025-07-01*");
    });

    it("omits page_age when null", () => {
        const response: SearchResponse = {
            results: [
                { title: "Source", url: "https://example.com", pageAge: null },
            ],
            textAnswer: "",
        };
        const output = formatResults("query", response);
        expect(output).toContain("[Source](https://example.com)");
        expect(output).not.toContain("*2025");
    });

    it("separates answer and sources with horizontal rule", () => {
        const response: SearchResponse = {
            results: [{ title: "S", url: "https://x.com", pageAge: null }],
            textAnswer: "Answer.",
        };
        const output = formatResults("query", response);
        expect(output).toContain("---");
    });

    it("handles results-only with no text answer", () => {
        const response: SearchResponse = {
            results: [{ title: "Only Result", url: "https://only.com", pageAge: null }],
            textAnswer: "",
        };
        const output = formatResults("query", response);
        expect(output).toContain("[Only Result](https://only.com)");
        expect(output).not.toContain("## Search Results Summary");
    });
});

describe("formatError", () => {
    it("formats MISSING_API_KEY with setup instructions", () => {
        const error = new SearchError(SearchErrorCode.MISSING_API_KEY, "No key found");
        const output = formatError(error);
        expect(output).toContain("DEEPSEEK_API_KEY");
        expect(output).toContain("No key found");
    });

    it("formats RATE_LIMITED with retry guidance", () => {
        const error = new SearchError(SearchErrorCode.RATE_LIMITED, "Too many requests", 429);
        const output = formatError(error);
        expect(output).toContain("Rate limited");
        expect(output).toContain("429");
    });

    it("includes error message and code for generic errors", () => {
        const error = new SearchError(SearchErrorCode.API_ERROR, "Bad request", 400);
        const output = formatError(error);
        expect(output).toContain("Bad request");
        expect(output).toContain("API_ERROR");
    });
});
