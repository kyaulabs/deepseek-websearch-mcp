# @kyaulabs/deepseek-websearch

[![npm](https://img.shields.io/npm/v/@kyaulabs/deepseek-websearch?logo=npm)](https://www.npmjs.com/package/@kyaulabs/deepseek-websearch)
[![GitHub](https://img.shields.io/github/license/kyaulabs/deepseek-websearch-mcp?logo=creativecommons)](LICENSE)
[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-fe5196?style=flat&logo=conventionalcommits)](https://conventionalcommits.org)
[![Semantic Versioning](https://img.shields.io/badge/release-1.0.0-blue?logo=semver)](https://semver.org)
[![DeepSeek](https://img.shields.io/badge/deepseek-v4--flash-4d6bfe?logo=deepseek)](https://platform.deepseek.com)
[![MCP](https://img.shields.io/badge/MCP-server-7c3aed)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js)](https://nodejs.org)

An OpenCode-native MCP server that gives your agents real-time web search via DeepSeek's server-side `web_search_20250305` tool. One tool call handles search, page fetch, decryption, and answer synthesis — no third-party search API required.

> [!NOTE]
> Based on [lyumeng/websearch-deepseek](https://github.com/lyumeng/websearch-deepseek) (MIT). See [Attribution](#attribution).

## How It Works

DeepSeek's Anthropic-compatible endpoint implements a built-in `web_search_20250305` tool type. When your OpenCode agent calls the `web_search` tool, this MCP server forwards the query to DeepSeek, which performs the entire search pipeline server-side:

```
Agent calls web_search("latest Rust version")
    │
    ▼
MCP Server ──POST──▶ api.deepseek.com/anthropic/v1/messages
                      tools: [{ type: "web_search_20250305" }]
                      │
                      ▼  (all server-side)
                      1. Search the web
                      2. Fetch relevant pages
                      3. Decrypt page content
                      4. Synthesize a detailed answer
                      │
                      ▼
MCP Server ◀──response── { text answer + source URLs }
    │
    ▼
Agent receives Markdown answer with cited sources
```

No SerpAPI. No Tavily. No Brave Search key. DeepSeek does the searching itself.

## Quick Start

### 1. Get a DeepSeek API Key

Sign up at [platform.deepseek.com](https://platform.deepseek.com/) and create an API key.

### 2. Add to Your OpenCode Config

Add the server to your project's `opencode.json` (or `~/.config/opencode/opencode.json` for global):

```json
{
  "$schema": "https://opencode.ai/config.json",
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

The `{env:DEEPSEEK_API_KEY}` syntax reads from your environment — set it in `.envrc` (direnv) or your shell profile:

```bash
export DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 3. Ask Your Agent

Restart OpenCode. Your agent now has a `web_search` tool available. Ask anything that needs current information:

- *"What's new in React 19?"*
- *"Search for the latest Node.js LTS release schedule"*
- *"Find the current DeepSeek API pricing"*

The agent will automatically invoke `web_search` when it needs real-time data beyond its training cutoff.

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | **Yes** | — | DeepSeek API key |
| `WEBSEARCH_API_KEY` | No | — | Fallback key variable name |
| `WEBSEARCH_MODEL` | No | `deepseek-v4-flash` | `deepseek-v4-flash` (fast) or `deepseek-v4-pro` (powerful) |
| `WEBSEARCH_THINKING` | No | `enabled` | `enabled` or `disabled` |
| `WEBSEARCH_MAX_TOKENS` | No | `32768` | Max response tokens |
| `WEBSEARCH_BASE_URL` | No | `https://api.deepseek.com/anthropic` | API base URL (for proxies) |

### JSON Config File

Prefer a config file over env vars? Create `~/.deepseek-websearch.json`:

```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  "model": "deepseek-v4-pro",
  "thinking": "disabled",
  "maxTokens": 16384
}
```

**Resolution order** (each layer overrides the previous): defaults → JSON file → environment variables.

### Model Selection

| Model | Speed | Cost | Use When |
| --- | --- | --- | --- |
| `deepseek-v4-flash` | Fast | Low | Daily searches (default) |
| `deepseek-v4-pro` | Slower | Higher | Deep research, complex queries |

### Cost

Each search consumes ~8,000–15,000 DeepSeek API tokens (search + thinking + answer generation). Check [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing) for current rates.

## Features

- **Zero runtime dependencies** beyond the official `@modelcontextprotocol/sdk`
- **Official MCP SDK** — proper capability negotiation, error envelopes, no hand-rolled JSON-RPC
- **TypeScript strict mode** with 90%+ test coverage (Vitest)
- **Structured errors** — rate-limit detection (429), network errors, API errors, cancellation
- **Configurable** — env vars, JSON config file, or per-call programmatic overrides
- **AbortSignal support** — searches are cancellable
- **Clean module separation** — import `searchWeb()` directly from your own code if you don't need the MCP layer

## Development

```bash
npm install              # install dependencies
npm test                 # run unit test suite (56 tests)
npm run test:integration # run live API tests (requires DEEPSEEK_API_KEY)
npm run build            # compile TypeScript → dist/
npm run check            # type-check without emitting
```

### Using the Core Library Directly

The search logic is framework-agnostic. You can import it without the MCP server:

```typescript
import { searchWeb } from "@kyaulabs/deepseek-websearch/search";

const result = await searchWeb("latest TypeScript features");
console.log(result.textAnswer);  // AI-generated answer
console.log(result.results);     // SearchResult[] with title, url, pageAge
```

## Attribution

This project is based on [**lyumeng/websearch-deepseek**](https://github.com/lyumeng/websearch-deepseek) by [@lyumeng](https://github.com/lyumeng), originally released under the [MIT License](https://github.com/lyumeng/websearch-deepseek/blob/main/LICENSE).

The original project established the approach of using DeepSeek's Anthropic-compatible endpoint with the `web_search_20250305` tool type for server-side web search via MCP. This version is an independent engineering rewrite with the following improvements:

- Official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) replaces hand-rolled JSON-RPC
- TypeScript strict mode with comprehensive Vitest test suite (90%+ coverage)
- Structured error handling with actionable codes (rate-limit detection, invalid config)
- Env vars + optional JSON config file with merge cascade
- Bug fix: system prompt placed as top-level `system` parameter (correct Anthropic Messages API format)
