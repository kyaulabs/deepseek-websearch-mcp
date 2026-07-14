import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchWeb, SYSTEM_PROMPT } from "../src/search.js";
import { SearchError, SearchErrorCode } from "../src/errors.js";

function mockResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: () => Promise.resolve(JSON.stringify(body)),
        json: () => Promise.resolve(body),
    } as Response;
}

const SAMPLE_RESPONSE = {
    content: [
        {
            type: "web_search_tool_result",
            content: [
                {
                    type: "web_search_result",
                    title: "Node.js Releases",
                    url: "https://nodejs.org/en/about/releases",
                    page_age: "2025-07-01",
                    encrypted_content: "enc_abc123",
                },
                {
                    type: "web_search_result",
                    title: "GitHub - nodejs/node",
                    url: "https://github.com/nodejs/node",
                    page_age: null,
                },
            ],
        },
        {
            type: "text",
            text: "Node.js 24 is the latest LTS version as of 2025.",
        },
    ],
};

describe("SYSTEM_PROMPT", () => {
    it("is a non-empty string", () => {
        expect(typeof SYSTEM_PROMPT).toBe("string");
        expect(SYSTEM_PROMPT.length).toBeGreaterThan(50);
    });

    it("instructs to use web_search", () => {
        expect(SYSTEM_PROMPT).toContain("web_search");
    });

    it("instructs to answer in the user's language", () => {
        expect(SYSTEM_PROMPT).toContain("language");
    });
});

describe("searchWeb", () => {
    const originalFetch = globalThis.fetch;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        globalThis.fetch = fetchMock as unknown as typeof fetch;
        process.env.DEEPSEEK_API_KEY = "sk-test-key";
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        delete process.env.DEEPSEEK_API_KEY;
    });

    it("sends POST to /v1/messages with correct body structure", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("Node.js LTS versions");

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toBe("https://api.deepseek.com/anthropic/v1/messages");
        expect(init.method).toBe("POST");
        expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
        expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-test-key");
    });

    it("places system prompt as top-level param, NOT in messages array", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("test query");

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body.system).toBeDefined();
        expect(body.system).toBe(SYSTEM_PROMPT);
        // Messages should NOT contain a system role message
        expect(body.messages).toHaveLength(1);
        expect(body.messages[0].role).toBe("user");
        expect(body.messages[0].content).toBe("test query");
    });

    it("includes web_search_20250305 tool declaration", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("test");

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body.tools).toEqual([
            { type: "web_search_20250305", name: "web_search" },
        ]);
        expect(body.tool_choice).toEqual({ type: "auto" });
    });

    it("includes thinking config when thinking is enabled (default)", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("test");

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body.thinking).toEqual({ type: "enabled" });
    });

    it("omits thinking config when thinking is disabled", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("test", { thinking: "disabled" });

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body.thinking).toBeUndefined();
    });

    it("parses search results from web_search_tool_result blocks", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        const result = await searchWeb("Node.js");

        expect(result.results).toHaveLength(2);
        expect(result.results[0]).toEqual({
            title: "Node.js Releases",
            url: "https://nodejs.org/en/about/releases",
            pageAge: "2025-07-01",
            encryptedContent: "enc_abc123",
        });
        expect(result.results[1]).toEqual({
            title: "GitHub - nodejs/node",
            url: "https://github.com/nodejs/node",
            pageAge: null,
        });
    });

    it("extracts text answer from text blocks", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        const result = await searchWeb("Node.js");

        expect(result.textAnswer).toBe("Node.js 24 is the latest LTS version as of 2025.");
    });

    it("handles response with empty content array", async () => {
        fetchMock.mockResolvedValue(mockResponse({ content: [] }));

        const result = await searchWeb("test");

        expect(result.results).toEqual([]);
        expect(result.textAnswer).toBe("");
    });

    it("handles response with no content field", async () => {
        fetchMock.mockResolvedValue(mockResponse({}));

        const result = await searchWeb("test");

        expect(result.results).toEqual([]);
        expect(result.textAnswer).toBe("");
    });

    it("joins multiple text blocks with double newline", async () => {
        const multiTextResponse = {
            content: [
                { type: "text", text: "First paragraph." },
                { type: "text", text: "Second paragraph." },
            ],
        };
        fetchMock.mockResolvedValue(mockResponse(multiTextResponse));

        const result = await searchWeb("test");

        expect(result.textAnswer).toBe("First paragraph.\n\nSecond paragraph.");
    });

    it("throws RATE_LIMITED on 429 status", async () => {
        fetchMock.mockResolvedValue(mockResponse({ error: "rate limited" }, 429));

        try {
            await searchWeb("test");
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(SearchError);
            expect((e as SearchError).code).toBe(SearchErrorCode.RATE_LIMITED);
            expect((e as SearchError).statusCode).toBe(429);
        }
    });

    it("throws API_ERROR on other non-OK statuses", async () => {
        fetchMock.mockResolvedValue(mockResponse({ error: "unauthorized" }, 401));

        try {
            await searchWeb("test");
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(SearchError);
            expect((e as SearchError).code).toBe(SearchErrorCode.API_ERROR);
            expect((e as SearchError).statusCode).toBe(401);
        }
    });

    it("throws NETWORK_ERROR when fetch rejects", async () => {
        fetchMock.mockRejectedValue(new TypeError("fetch failed"));

        try {
            await searchWeb("test");
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(SearchError);
            expect((e as SearchError).code).toBe(SearchErrorCode.NETWORK_ERROR);
        }
    });

    it("throws CANCELLED when AbortSignal is aborted", async () => {
        const abortError = new Error("aborted");
        abortError.name = "AbortError";
        fetchMock.mockRejectedValue(abortError);

        try {
            await searchWeb("test", { signal: new AbortController().signal });
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(SearchError);
            expect((e as SearchError).code).toBe(SearchErrorCode.CANCELLED);
        }
    });

    it("throws MISSING_API_KEY when no key available", async () => {
        delete process.env.DEEPSEEK_API_KEY;
        delete process.env.WEBSEARCH_API_KEY;

        try {
            await searchWeb("test");
            expect.fail("Should have thrown");
        } catch (e) {
            expect(e).toBeInstanceOf(SearchError);
            expect((e as SearchError).code).toBe(SearchErrorCode.MISSING_API_KEY);
        }
    });

    it("uses custom apiKey from options (bypasses env)", async () => {
        delete process.env.DEEPSEEK_API_KEY;
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("test", { apiKey: "sk-custom" });

        const init = fetchMock.mock.calls[0][1] as RequestInit;
        expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-custom");
    });

    it("uses custom model from options", async () => {
        fetchMock.mockResolvedValue(mockResponse(SAMPLE_RESPONSE));

        await searchWeb("test", { model: "deepseek-v4-pro" });

        const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
        expect(body.model).toBe("deepseek-v4-pro");
    });
});
