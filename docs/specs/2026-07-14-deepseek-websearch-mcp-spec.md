# Spec: @kyaulabs/deepseek-websearch — DeepSeek Web Search MCP Server

**Date:** 2026-07-14
**Status:** Approved

## 1. Problem Statement

The `lyumeng/websearch-deepseek` project demonstrates web search via DeepSeek's native server-side `web_search_20250305` tool — one API call handles search, page fetch, decryption, and answer synthesis. However, it has engineering gaps: hand-rolled JSON-RPC (no SDK), zero test coverage, a system-prompt placement bug (in messages array instead of top-level), and env-var-only configuration.

## 2. Goals

- Build a standalone TypeScript MCP server that exposes a `web_search` tool powered by DeepSeek's Anthropic-compatible endpoint
- Use the official `@modelcontextprotocol/sdk` instead of hand-rolled JSON-RPC
- TypeScript strict mode with a comprehensive Vitest test suite (90%+ coverage)
- Structured error handling with actionable error codes (including rate-limit detection)
- Configuration via env vars with optional JSON config file override cascade
- Publishable to npm as `@kyaulabs/deepseek-websearch`
- opencode-first design, compatible with any MCP client (Cursor, Claude Code, Continue)

## 3. Non-Goals

- Multiple tools (deep_research, image_search, etc.) — YAGNI
- Streaming responses — DeepSeek web search tool returns a single completion
- Result caching
- Cost/token tracking
- OpenAI-compatible endpoint support — it doesn't support `web_search_20250305`
- Self-hosted page fetching
- Bilingual output — English-only

## 4. Architecture

```
MCP Client (opencode/Cursor/Claude Code)
    |
    |  stdio (JSON-RPC 2.0)
    v
+------------------------------------------------------+
|  @kyaulabs/deepseek-websearch                         |
|                                                       |
|  index.ts -- MCP SDK Server                           |
|      |                                                |
|      +-- tools/list -> web_search definition           |
|      +-- tools/call                                   |
|           +-- config.ts (loadConfig merge)             |
|           +-- search.ts (searchWeb)                   |
|           +-- format.ts (formatResults)               |
|                                                       |
|  errors.ts <- SearchError hierarchy                    |
|  types.ts  <- shared interfaces                       |
+-------------------------|-----------------------------+
                          | HTTPS POST
                          v
    api.deepseek.com/anthropic/v1/messages
    tools: [{ type: "web_search_20250305" }]
    -> server-side: search -> fetch -> decrypt -> synthesize
```

## 5. Module Specifications

### 5.1 types.ts

Shared TypeScript interfaces: `SearchResult`, `SearchResponse`, `SearchOptions`, `ServerConfig`, `DeepSeekContentBlock`, `DeepSeekApiResponse`.

### 5.2 errors.ts

`SearchErrorCode` enum: `MISSING_API_KEY`, `INVALID_CONFIG`, `NETWORK_ERROR`, `API_ERROR`, `RATE_LIMITED`, `CANCELLED`.
`SearchError` class extends `Error` with `code` and optional `statusCode`.

### 5.3 config.ts

Config merge cascade: **defaults → JSON file → env vars → programmatic overrides**.

JSON config file: `~/.deepseek-websearch.json` or `DEEPSEEK_WEBSEARCH_CONFIG` path.
Env vars: `DEEPSEEK_API_KEY`, `WEBSEARCH_API_KEY` (fallback), `WEBSEARCH_MODEL`, `WEBSEARCH_THINKING`, `WEBSEARCH_MAX_TOKENS`, `WEBSEARCH_BASE_URL`.

Defaults: `baseUrl: "https://api.deepseek.com/anthropic"`, `model: "deepseek-v4-flash"`, `thinking: "enabled"`, `maxTokens: 32768`.

### 5.4 search.ts

Framework-agnostic `searchWeb(query, options?)` function:
- POSTs to Anthropic-compatible endpoint with `x-api-key` auth
- `system` as top-level param (Anthropic format — **fixes original bug**)
- `tools: [{ type: "web_search_20250305", name: "web_search" }]`
- `tool_choice: { type: "auto" }`
- `thinking: { type: "enabled" }` when enabled
- Parses response: `web_search_tool_result` blocks → SearchResult[], `text` blocks → textAnswer

### 5.5 format.ts

`formatResults(query, response)` → Markdown: answer heading + text + "---" + numbered source list with page_age.
`formatError(error)` → code-specific user guidance with setup instructions.

### 5.6 index.ts

MCP server using `@modelcontextprotocol/sdk`:
- Exports `createServer()` factory for testability
- Registers `web_search` tool with `query` (required) and `explanation` (optional)
- Connects via `StdioServerTransport`

## 6. Configuration

### 6.1 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | Yes | — | DeepSeek API Key |
| `WEBSEARCH_API_KEY` | No | — | Fallback API key variable |
| `WEBSEARCH_MODEL` | No | `deepseek-v4-flash` | Model selection |
| `WEBSEARCH_THINKING` | No | `enabled` | Thinking mode |
| `WEBSEARCH_MAX_TOKENS` | No | `32768` | Max tokens |
| `WEBSEARCH_BASE_URL` | No | `https://api.deepseek.com/anthropic` | API base URL |

### 6.2 JSON Config File

Optional `~/.deepseek-websearch.json` with any subset of: `apiKey`, `model`, `thinking`, `maxTokens`. Env vars override the file.

## 7. Error Handling

| Code | HTTP | Message |
|---|---|---|
| `MISSING_API_KEY` | — | "No DeepSeek API key found..." |
| `INVALID_CONFIG` | — | "Config file at {path} is invalid JSON..." |
| `NETWORK_ERROR` | — | "Network error reaching DeepSeek API..." |
| `RATE_LIMITED` | 429 | "Rate limited. Wait and retry." |
| `API_ERROR` | 401/500/etc | "DeepSeek API error ({status})..." |
| `CANCELLED` | — | "Search was cancelled." |

## 8. Testing

| File | Scope | Network |
|---|---|---|
| `search.test.ts` | Request body, response parsing, error codes, abort | No (mock fetch) |
| `format.test.ts` | Markdown output variants | No |
| `config.test.ts` | Merge cascade, file I/O, env vars | No |
| `errors.test.ts` | Construction, instanceof | No |
| `integration.test.ts` | Real API round-trip | Yes (gated on API key) |

Coverage target: 90%+ on non-type-definition code.

## 9. opencode.json Integration

```json
{
  "mcp": {
    "deepseek-websearch": {
      "type": "local",
      "command": ["npx", "@kyaulabs/deepseek-websearch"],
      "enabled": true,
      "environment": {
        "DEEPSEEK_API_KEY": "{env:DEEPSEEK_API_KEY}"
      }
    }
  }
}
```

## 10. Key Technical Insight

DeepSeek's Anthropic-compatible endpoint (`/anthropic/v1/messages`) is the **only** endpoint that supports the `web_search_20250305` server-side tool type. The OpenAI-compatible endpoint (`/chat/completions`) does not have this feature — it only supports standard function calling (client-side). This is the foundational reason the entire design uses the Anthropic format.

**Key bug fix over the original:** The system prompt must be a top-level `system` parameter (correct Anthropic Messages API format), not a message with role `"system"` in the `messages` array. The original repo has this wrong.
