/**
 * @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server
 * Markdown output formatting for search results and errors.
 *
 * @module
 */

import type { SearchResponse } from "./types.js";
import { SearchError, SearchErrorCode } from "./errors.js";

/**
 * Format search response into a human-readable Markdown string.
 *
 * Output has two sections:
 *   1. Model's text answer (based on server-side decrypted page content)
 *   2. Source URLs (numbered list with optional page age)
 */
export function formatResults(query: string, response: SearchResponse): string {
    const { results, textAnswer } = response;

    if (results.length === 0 && !textAnswer) {
        return `Web search for **"${query}"** returned no results. Try rephrasing with more specific keywords.`;
    }

    const lines: string[] = [];

    // Section 1: Answer
    if (textAnswer) {
        if (textAnswer.startsWith("##") || textAnswer.startsWith("# ")) {
            lines.push(textAnswer);
        } else {
            lines.push("## Search Results Summary");
            lines.push("");
            lines.push(textAnswer);
        }
    }

    // Section 2: Sources
    if (results.length > 0) {
        if (textAnswer) {
            lines.push("");
            lines.push("---");
        }
        lines.push("");
        lines.push(`### Sources (${results.length}):`);
        lines.push("");
        for (let i = 0; i < results.length; i++) {
            const r = results[i]!;
            lines.push(`${i + 1}. [${r.title}](${r.url})`);
            if (r.pageAge) {
                lines.push(`   - *${r.pageAge}*`);
            }
        }
    }

    return lines.join("\n");
}

/**
 * Format a SearchError into a user-friendly message string.
 * Provides actionable guidance based on the error code.
 */
export function formatError(error: SearchError): string {
    switch (error.code) {
        case SearchErrorCode.MISSING_API_KEY:
            return [
                "❌ No DeepSeek API key configured.",
                "",
                "Set the DEEPSEEK_API_KEY environment variable:",
                "  export DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx",
                "",
                "Or create ~/.deepseek-websearch.json:",
                '  {"apiKey": "sk-xxxxxxxxxxxxxxxx"}',
                "",
                `Original error: ${error.message}`,
            ].join("\n");

        case SearchErrorCode.RATE_LIMITED:
            return [
                `⚠️ Rate limited by DeepSeek API (HTTP ${error.statusCode ?? 429}).`,
                "Wait a moment and try again.",
            ].join("\n");

        default:
            return [
                `❌ Search failed [${error.code}]${error.statusCode ? ` (HTTP ${error.statusCode})` : ""}`,
                error.message,
            ].join("\n");
    }
}
