import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock node:fs — file doesn't exist by default
vi.mock("node:fs", () => ({
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => ""),
}));

import { loadConfig, DEFAULTS } from "../src/config.js";
import { SearchError, SearchErrorCode } from "../src/errors.js";

function clearSearchEnv(): () => void {
    const saved: Record<string, string | undefined> = {};
    const keys = [
        "DEEPSEEK_API_KEY",
        "WEBSEARCH_API_KEY",
        "WEBSEARCH_MODEL",
        "WEBSEARCH_THINKING",
        "WEBSEARCH_MAX_TOKENS",
        "WEBSEARCH_BASE_URL",
        "DEEPSEEK_WEBSEARCH_CONFIG",
    ];
    for (const k of keys) {
        saved[k] = process.env[k];
        delete process.env[k];
    }
    return () => {
        for (const k of keys) {
            if (saved[k] === undefined) {
                delete process.env[k];
            } else {
                process.env[k] = saved[k];
            }
        }
    };
}

describe("DEFAULTS", () => {
    it("has correct default values", () => {
        expect(DEFAULTS.baseUrl).toBe("https://api.deepseek.com/anthropic");
        expect(DEFAULTS.model).toBe("deepseek-v4-flash");
        expect(DEFAULTS.thinking).toBe("enabled");
        expect(DEFAULTS.maxTokens).toBe(32768);
    });
});

describe("loadConfig", () => {
    let restore: () => void;

    beforeEach(() => {
        restore = clearSearchEnv();
        vi.clearAllMocks();
    });

    afterEach(() => {
        restore();
    });

    it("throws MISSING_API_KEY when no key is configured", () => {
        expect(() => loadConfig()).toThrow(SearchError);
        try {
            loadConfig();
        } catch (e) {
            expect((e as SearchError).code).toBe(SearchErrorCode.MISSING_API_KEY);
        }
    });

    it("loads apiKey from DEEPSEEK_API_KEY env var", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test-key-123";
        const config = loadConfig();
        expect(config.apiKey).toBe("sk-test-key-123");
        expect(config.model).toBe("deepseek-v4-flash");
        expect(config.baseUrl).toBe("https://api.deepseek.com/anthropic");
    });

    it("falls back to WEBSEARCH_API_KEY", () => {
        process.env.WEBSEARCH_API_KEY = "sk-fallback-key";
        const config = loadConfig();
        expect(config.apiKey).toBe("sk-fallback-key");
    });

    it("DEEPSEEK_API_KEY takes precedence over WEBSEARCH_API_KEY", () => {
        process.env.DEEPSEEK_API_KEY = "sk-primary";
        process.env.WEBSEARCH_API_KEY = "sk-fallback";
        const config = loadConfig();
        expect(config.apiKey).toBe("sk-primary");
    });

    it("uses defaults for model, thinking, and baseUrl", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        const config = loadConfig();
        expect(config.model).toBe("deepseek-v4-flash");
        expect(config.thinking).toBe("enabled");
        expect(config.baseUrl).toBe("https://api.deepseek.com/anthropic");
        expect(config.maxTokens).toBe(32768);
    });

    it("overrides model from WEBSEARCH_MODEL env var", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        process.env.WEBSEARCH_MODEL = "deepseek-v4-pro";
        const config = loadConfig();
        expect(config.model).toBe("deepseek-v4-pro");
    });

    it("overrides thinking from WEBSEARCH_THINKING env var", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        process.env.WEBSEARCH_THINKING = "disabled";
        const config = loadConfig();
        expect(config.thinking).toBe("disabled");
    });

    it("ignores invalid WEBSEARCH_THINKING values", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        process.env.WEBSEARCH_THINKING = "maybe";
        const config = loadConfig();
        expect(config.thinking).toBe("enabled"); // default
    });

    it("parses WEBSEARCH_MAX_TOKENS as number", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        process.env.WEBSEARCH_MAX_TOKENS = "16384";
        const config = loadConfig();
        expect(config.maxTokens).toBe(16384);
    });

    it("ignores non-numeric WEBSEARCH_MAX_TOKENS", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        process.env.WEBSEARCH_MAX_TOKENS = "abc";
        const config = loadConfig();
        expect(config.maxTokens).toBe(32768); // default
    });

    it("overrides baseUrl from WEBSEARCH_BASE_URL env var", () => {
        process.env.DEEPSEEK_API_KEY = "sk-test";
        process.env.WEBSEARCH_BASE_URL = "https://custom.proxy.com/anthropic";
        const config = loadConfig();
        expect(config.baseUrl).toBe("https://custom.proxy.com/anthropic");
    });

    it("handles multiple env var overrides simultaneously", () => {
        process.env.DEEPSEEK_API_KEY = "sk-multi";
        process.env.WEBSEARCH_MODEL = "deepseek-v4-pro";
        process.env.WEBSEARCH_THINKING = "disabled";
        process.env.WEBSEARCH_MAX_TOKENS = "8192";
        process.env.WEBSEARCH_BASE_URL = "https://proxy.example.com";
        const config = loadConfig();
        expect(config.apiKey).toBe("sk-multi");
        expect(config.model).toBe("deepseek-v4-pro");
        expect(config.thinking).toBe("disabled");
        expect(config.maxTokens).toBe(8192);
        expect(config.baseUrl).toBe("https://proxy.example.com");
    });
});
