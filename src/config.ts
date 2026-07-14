/**
 * @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server
 * Configuration loader with merge cascade: defaults → file → env.
 *
 * @module
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { ServerConfig } from "./types.js";
import { SearchError, SearchErrorCode } from "./errors.js";

/** Built-in default configuration values. */
export const DEFAULTS = {
    baseUrl: "https://api.deepseek.com/anthropic",
    model: "deepseek-v4-flash",
    thinking: "enabled" as const,
    maxTokens: 32768,
};

/** Path to optional JSON config file in user's home directory. */
const DEFAULT_CONFIG_PATH = join(homedir(), ".deepseek-websearch.json");

/**
 * Attempt to read JSON config file. Returns empty object if file
 * does not exist. Throws INVALID_CONFIG if file exists but is malformed.
 */
function loadConfigFile(): Partial<ServerConfig> {
    const configPath = process.env.DEEPSEEK_WEBSEARCH_CONFIG || DEFAULT_CONFIG_PATH;

    if (!existsSync(configPath)) {
        return {};
    }

    let raw: string;
    try {
        raw = readFileSync(configPath, "utf-8");
    } catch {
        return {};
    }

    try {
        return JSON.parse(raw) as Partial<ServerConfig>;
    } catch (err) {
        throw new SearchError(
            SearchErrorCode.INVALID_CONFIG,
            `Config file at ${configPath} is invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
        );
    }
}

/** Read configuration from environment variables. */
function loadEnvConfig(): Partial<ServerConfig> {
    const env = process.env;
    const config: Partial<ServerConfig> = {};

    const apiKey = env.DEEPSEEK_API_KEY || env.WEBSEARCH_API_KEY;
    if (apiKey) {
        config.apiKey = apiKey;
    }

    if (env.WEBSEARCH_MODEL) {
        config.model = env.WEBSEARCH_MODEL;
    }

    if (env.WEBSEARCH_THINKING === "enabled" || env.WEBSEARCH_THINKING === "disabled") {
        config.thinking = env.WEBSEARCH_THINKING;
    }

    if (env.WEBSEARCH_MAX_TOKENS) {
        const parsed = parseInt(env.WEBSEARCH_MAX_TOKENS, 10);
        if (!Number.isNaN(parsed)) {
            config.maxTokens = parsed;
        }
    }

    if (env.WEBSEARCH_BASE_URL) {
        config.baseUrl = env.WEBSEARCH_BASE_URL;
    }

    return config;
}

/**
 * Load and merge configuration from all sources.
 *
 * Resolution order (later overrides earlier):
 *   1. Built-in defaults (DEFAULTS)
 *   2. JSON config file (~/.deepseek-websearch.json or DEEPSEEK_WEBSEARCH_CONFIG)
 *   3. Environment variables
 *
 * @throws {SearchError} MISSING_API_KEY if no key is found in any source.
 * @throws {SearchError} INVALID_CONFIG if config file exists but is malformed.
 */
export function loadConfig(): ServerConfig {
    const fileConfig = loadConfigFile();
    const envConfig = loadEnvConfig();

    const merged: ServerConfig = {
        apiKey: "",
        ...DEFAULTS,
        ...fileConfig,
        ...envConfig,
    };

    if (!merged.apiKey) {
        throw new SearchError(
            SearchErrorCode.MISSING_API_KEY,
            "No DeepSeek API key found. Set DEEPSEEK_API_KEY env var, " +
            "WEBSEARCH_API_KEY env var, or create ~/.deepseek-websearch.json.",
        );
    }

    return merged;
}
