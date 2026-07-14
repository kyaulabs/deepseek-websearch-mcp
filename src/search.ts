/**
 * @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server
 * Framework-agnostic core search logic. Calls DeepSeek's Anthropic-compatible
 * endpoint with the web_search_20250305 tool for server-side web search.
 *
 * @module
 */

import type {
    SearchResponse,
    SearchOptions,
    DeepSeekApiResponse,
    SearchResult,
} from "./types.js";
import { SearchError, SearchErrorCode } from "./errors.js";
import { loadConfig, DEFAULTS } from "./config.js";

/**
 * System prompt guiding DeepSeek to search and synthesize.
 * Placed as top-level `system` param (correct Anthropic format).
 */
export const SYSTEM_PROMPT = [
    "You are a web search assistant. Follow these rules strictly:",
    "",
    "1. Use web_search to find relevant, up-to-date information.",
    "2. After receiving results, write a comprehensive answer in plain text.",
    "   Include specific details, dates, and facts.",
    "3. Do NOT call web_search again after you have results.",
    "4. Answer in the same language the user used.",
    "5. If results are poor, explain why and suggest better keywords.",
].join("\n");

/** Resolve effective config from options → env → file → defaults. */
function resolveConfig(options: SearchOptions): {
    apiKey: string;
    baseUrl: string;
    model: string;
    thinking: "enabled" | "disabled";
    maxTokens: number;
} {
    const serverConfig = (() => {
        try {
            return loadConfig();
        } catch {
            return null;
        }
    })();

    const apiKey = options.apiKey ?? serverConfig?.apiKey ?? "";
    const baseUrl = options.baseUrl ?? serverConfig?.baseUrl ?? DEFAULTS.baseUrl;
    const model = options.model ?? serverConfig?.model ?? DEFAULTS.model;
    const thinking = options.thinking ?? serverConfig?.thinking ?? DEFAULTS.thinking;
    const maxTokens = options.maxTokens ?? serverConfig?.maxTokens ?? DEFAULTS.maxTokens;

    return { apiKey, baseUrl, model, thinking, maxTokens };
}

/** Parse DeepSeek API response into structured SearchResponse. */
function parseResponse(data: DeepSeekApiResponse): SearchResponse {
    const results: SearchResult[] = [];
    const textParts: string[] = [];

    if (!data.content || !Array.isArray(data.content)) {
        return { results, textAnswer: "" };
    }

    for (const block of data.content) {
        if (block.type === "web_search_tool_result" && block.content) {
            for (const item of block.content) {
                if (item.type === "web_search_result") {
                    results.push({
                        title: item.title || "Untitled",
                        url: item.url || "",
                        pageAge: item.page_age ?? null,
                        encryptedContent: item.encrypted_content,
                    });
                }
            }
        } else if (block.type === "text" && block.text?.trim()) {
            textParts.push(block.text.trim());
        }
    }

    return { results, textAnswer: textParts.join("\n\n") };
}

/**
 * Perform a web search using DeepSeek's native web search capability.
 *
 * Uses the Anthropic-compatible API with the web_search_20250305 tool type.
 * One API call handles search, page fetch, decryption, and answer synthesis.
 *
 * @param query - The search query string.
 * @param options - Optional configuration overrides.
 * @returns SearchResponse with results and AI-generated text answer.
 * @throws {SearchError} On any failure (missing key, network, API error, etc.)
 */
export async function searchWeb(
    query: string,
    options: SearchOptions = {},
): Promise<SearchResponse> {
    const config = resolveConfig(options);

    if (!config.apiKey) {
        throw new SearchError(
            SearchErrorCode.MISSING_API_KEY,
            "No DeepSeek API key found. Set DEEPSEEK_API_KEY or create ~/.deepseek-websearch.json.",
        );
    }

    const body: Record<string, unknown> = {
        model: config.model,
        max_tokens: config.maxTokens,
        system: SYSTEM_PROMPT,
        messages: [
            { role: "user", content: query },
        ],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        tool_choice: { type: "auto" },
    };

    if (config.thinking === "enabled") {
        body.thinking = { type: "enabled" };
    }

    let response: Response;
    try {
        response = await fetch(`${config.baseUrl}/v1/messages`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": config.apiKey,
            },
            body: JSON.stringify(body),
            signal: options.signal,
        });
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new SearchError(SearchErrorCode.CANCELLED, "Search was cancelled.");
        }
        throw new SearchError(
            SearchErrorCode.NETWORK_ERROR,
            `Network error: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    if (!response.ok) {
        const errText = await response.text().catch(() => "Unable to read error body");
        const code = response.status === 429
            ? SearchErrorCode.RATE_LIMITED
            : SearchErrorCode.API_ERROR;
        throw new SearchError(
            code,
            `DeepSeek API error (${response.status}): ${errText}`,
            response.status,
        );
    }

    const data = (await response.json()) as DeepSeekApiResponse;
    return parseResponse(data);
}
