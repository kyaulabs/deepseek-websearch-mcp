#!/usr/bin/env node
/**
 * @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server
 * MCP server entry point. Registers web_search tool and starts stdio transport.
 *
 * @module
 */

import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchWeb } from "./search.js";
import { formatResults, formatError } from "./format.js";
import { SearchError } from "./errors.js";

/** Tool definition for the web_search MCP tool. */
const WEB_SEARCH_TOOL = {
    name: "web_search",
    description:
        "Search the web for current, real-time, or factual information. " +
        "Use when you need information beyond training data — recent events, " +
        "current data, documentation lookups, or fact-checking. " +
        "Returns a detailed AI-generated answer based on full page content, " +
        "plus source URLs. Powered by DeepSeek's native web search.",
    inputSchema: {
        type: "object" as const,
        properties: {
            query: {
                type: "string",
                description: "The search query. Be specific and include relevant keywords.",
            },
            explanation: {
                type: "string",
                description: "One sentence explaining why this search is needed.",
            },
        },
        required: ["query"],
    },
};

/**
 * Create and configure the MCP server instance (without connecting transport).
 * Exported for testing — the entry point calls connect() separately.
 */
export function createServer(): Server {
    const server = new Server(
        { name: "deepseek-websearch", version: "1.0.0" },
        { capabilities: { tools: {} } },
    );

    // ── tools/list ──────────────────────────────────────────────
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [WEB_SEARCH_TOOL],
    }));

    // ── tools/call ──────────────────────────────────────────────
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (name !== "web_search") {
            throw new Error(`Unknown tool: ${name}`);
        }

        const query = (args?.query as string)?.trim();
        if (!query) {
            return {
                content: [{ type: "text" as const, text: "Error: empty search query." }],
                isError: true,
            };
        }

        try {
            const response = await searchWeb(query);
            return {
                content: [{ type: "text" as const, text: formatResults(query, response) }],
            };
        } catch (error) {
            const text = error instanceof SearchError
                ? formatError(error)
                : `Web search failed: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: "text" as const, text }],
                isError: true,
            };
        }
    });

    return server;
}

// ── Entry point: start stdio transport (only when run directly) ──────────
async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    const server = createServer();
    await server.connect(transport);
}

// Run only when executed directly (not when imported for testing)
//const isDirectRun = process.argv[1]?.endsWith("index.ts") ||
    //process.argv[1]?.endsWith("index.js");
const currentScript = realpathSync(fileURLToPath(import.meta.url));
const isDirectRun = process.argv[1] && realpathSync(process.argv[1]) === currentScript;

if (isDirectRun) {
    main().catch((error) => {
        process.stderr.write(`Fatal error: ${error instanceof Error ? error.message : String(error)}\n`);
        process.exit(1);
    });
}
