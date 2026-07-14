import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the search module to avoid real API calls
vi.mock("../src/search.js", () => ({
    searchWeb: vi.fn(),
    SYSTEM_PROMPT: "test system prompt",
}));

vi.mock("../src/format.js", () => ({
    formatResults: vi.fn(() => "## Formatted Results\n\nMocked output"),
    formatError: vi.fn(() => "Formatted error text"),
}));

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { searchWeb } from "../src/search.js";
import { formatResults, formatError } from "../src/format.js";
import { createServer } from "../src/index.js";
import { SearchError, SearchErrorCode } from "../src/errors.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";

async function setupTest(): Promise<{ client: Client; server: Server }> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    await server.connect(serverTransport);

    const client = new Client(
        { name: "test-client", version: "1.0.0" },
        { capabilities: {} },
    );
    await client.connect(clientTransport);

    return { client, server };
}

describe("MCP Server", () => {
    let client: Client;
    let server: Server;

    beforeEach(async () => {
        const setup = await setupTest();
        client = setup.client;
        server = setup.server;
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await server.close();
        await client.close();
    });

    it("registers exactly one tool named web_search", async () => {
        const result = await client.listTools();
        expect(result.tools).toHaveLength(1);
        expect(result.tools[0].name).toBe("web_search");
    });

    it("tool has query parameter marked as required", async () => {
        const result = await client.listTools();
        const schema = result.tools[0].inputSchema as any;
        expect(schema.properties.query).toBeDefined();
        expect(schema.properties.explanation).toBeDefined();
        expect(schema.required).toEqual(["query"]);
    });

    it("tool has a meaningful description", async () => {
        const result = await client.listTools();
        expect(result.tools[0].description).toBeTruthy();
        expect(result.tools[0].description!.length).toBeGreaterThan(20);
    });

    it("returns formatted results on successful search", async () => {
        const mockResponse = { results: [], textAnswer: "test answer" };
        vi.mocked(searchWeb).mockResolvedValue(mockResponse);
        vi.mocked(formatResults).mockReturnValue("## Test Results\n\nAnswer here");

        const result = await client.callTool({
            name: "web_search",
            arguments: { query: "test query" },
        });

        expect(searchWeb).toHaveBeenCalledWith("test query");
        expect(formatResults).toHaveBeenCalledWith("test query", mockResponse);
        expect(result.content).toHaveLength(1);
        expect(result.content[0]).toEqual({
            type: "text",
            text: "## Test Results\n\nAnswer here",
        });
        expect(result.isError).toBeFalsy();
    });

    it("returns error when query is empty string", async () => {
        const result = await client.callTool({
            name: "web_search",
            arguments: { query: "   " },
        });

        expect(searchWeb).not.toHaveBeenCalled();
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("empty");
    });

    it("returns formatted error on search failure", async () => {
        const error = new SearchError(SearchErrorCode.API_ERROR, "API failure", 500);
        vi.mocked(searchWeb).mockRejectedValue(error);
        vi.mocked(formatError).mockReturnValue("formatted error text");

        const result = await client.callTool({
            name: "web_search",
            arguments: { query: "test" },
        });

        expect(formatError).toHaveBeenCalled();
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe("formatted error text");
    });

    it("handles non-SearchError exceptions gracefully", async () => {
        vi.mocked(searchWeb).mockRejectedValue(new Error("generic failure"));

        const result = await client.callTool({
            name: "web_search",
            arguments: { query: "test" },
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain("generic failure");
    });
});
