/**
 * @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server
 * Shared type definitions.
 *
 * @module
 */

/** Individual search result entry from DeepSeek's web_search tool. */
export interface SearchResult {
    title: string;
    url: string;
    pageAge: string | null;
    encryptedContent?: string;
}

/** Response from searchWeb() — search results + synthesized answer. */
export interface SearchResponse {
    results: SearchResult[];
    textAnswer: string;
}

/** Per-call options passed to searchWeb(). Override resolved config. */
export interface SearchOptions {
    apiKey?: string;
    signal?: AbortSignal;
    baseUrl?: string;
    model?: string;
    thinking?: "enabled" | "disabled";
    maxTokens?: number;
}

/** Fully resolved server configuration after merge cascade. */
export interface ServerConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
    thinking: "enabled" | "disabled";
    maxTokens: number;
}

/** Content block in DeepSeek's Anthropic-format API response. */
export interface DeepSeekContentBlock {
    type: string;
    text?: string;
    content?: Array<{
        type: string;
        title?: string;
        url?: string;
        page_age?: string | null;
        encrypted_content?: string;
    }>;
}

/** Top-level response from DeepSeek's /anthropic/v1/messages endpoint. */
export interface DeepSeekApiResponse {
    content?: DeepSeekContentBlock[];
}
