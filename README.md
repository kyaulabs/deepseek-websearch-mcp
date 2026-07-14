# @kyaulabs/deepseek-websearch

[![Contributor Covenant](https://img.shields.io/badge/contributor%20covenant-2.1-4baaaa.svg?logo=open-source-initiative&logoColor=4baaaa)](CODE_OF_CONDUCT.md)
[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-fe5196?style=flat&logo=conventionalcommits)](https://conventionalcommits.org)
[![GitHub](https://img.shields.io/github/license/kyaulabs/pulsar?logo=creativecommons)](LICENSE)
[![npm](https://img.shields.io/npm/v/@kyaulabs/deepseek-websearch?logo=npm)](https://www.npmjs.com/package/@kyaulabs/deepseek-websearch)  
[![DeepSeek](https://img.shields.io/badge/deepseek-v4--pro-4d6bfe?logo=deepseek)](https://platform.deepseek.com)
[![z.AI](https://img.shields.io/badge/glm-5.2-2d2d2d?logo=data:image/svg%2bxml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgdmVyc2lvbj0iMS4yIiB2aWV3Qm94PSIwIDAgMzAgMzAiPgogIDwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAzMC4zLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiAyLjEuMyBCdWlsZCAxODIpICAtLT4KICA8ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgl8xIj4KICAgIDxwYXRoIGQ9Ik0yNC41LDI4LjVINS41Yy0yLjIsMC00LTEuOC00LTRWNS41QzEuNSwzLjMsMy4zLDEuNSw1LjUsMS41aDE5YzIuMiwwLDQsMS44LDQsNHYxOWMwLDIuMi0xLjgsNC00LDRaIiBmaWxsPSIjMmQyZDJkIi8+CiAgICA8Zz4KICAgICAgPHBhdGggZD0iTTE1LjUsNy4xYy0uNS41LTEuMywyLjQtMi4yLDIuMywwLDAtNy4xLDAtNy4xLDB2LTIuM3M5LjMsMCw5LjMsMFoiIGZpbGw9IiNmZmYiLz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIyNC4zIDcuMSAxMy4xIDIyLjkgNS43IDIyLjkgMTYuOSA3LjEgMjQuMyA3LjEiIGZpbGw9IiNmZmYiLz4KICAgICAgPHBhdGggZD0iTTE0LjUsMjIuOWMuNS0uNSwxLjMtMi40LDIuMi0yLjMsMCwwLDcuMSwwLDcuMSwwdjIuM2gtOS4zWiIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+)](https://z.ai)
[![OpenCode](https://img.shields.io/badge/opencode-harness-f1ecec?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0nMjQwJyBoZWlnaHQ9JzMwMCcgdmlld0JveD0nMCAwIDI0MCAzMDAnIGZpbGw9J25vbmUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGcgY2xpcC1wYXRoPSd1cmwoI2NsaXAwXzE0MDFfODYyODMpJz48bWFzayBpZD0nbWFzazBfMTQwMV84NjI4Mycgc3R5bGU9J21hc2stdHlwZTpsdW1pbmFuY2UnIG1hc2tVbml0cz0ndXNlclNwYWNlT25Vc2UnIHg9JzAnIHk9JzAnIHdpZHRoPScyNDAnIGhlaWdodD0nMzAwJz48cGF0aCBkPSdNMjQwIDBIMFYzMDBIMjQwVjBaJyBmaWxsPSd3aGl0ZScvPjwvbWFzaz48ZyBtYXNrPSd1cmwoI21hc2swXzE0MDFfODYyODMpJz48cGF0aCBkPSdNMTgwIDI0MEg2MFYxMjBIMTgwVjI0MFonIGZpbGw9JyM0QjQ2NDYnLz48cGF0aCBkPSdNMTgwIDYwSDYwVjI0MEgxODBWNjBaTTI0MCAzMDBIMFYwSDI0MFYzMDBaJyBmaWxsPScjRjFFQ0VDJy8+PC9nPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9J2NsaXAwXzE0MDFfODYyODMnPjxyZWN0IHdpZHRoPScyNDAnIGhlaWdodD0nMzAwJyBmaWxsPSd3aGl0ZScvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPgo=)](https://opancode.ai)
[![Visual Studio Code Insiders](https://img.shields.io/badge/vscode-insiders-24bfa5?logo=data:image/svg%2bxml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5maWxlX3R5cGVfdnNjb2RlLWluc2lkZXJzPC90aXRsZT48cGF0aCBkPSJNMjAuMzc1LDMuMjkxYS44NzQuODc0LDAsMCwxLDEuNDYzLjY0N1YxMC4yNWwtOC4zNiw2LjYyNEw5LjE3MiwxMy42MDhaIiBzdHlsZT0iZmlsbDojMDA5YTdjIi8+PHBhdGggZD0iTTYuMDEzLDE2LjY2OSwyLjM4LDE5LjhhMS4xNjYsMS4xNjYsMCwwLDAsMi4zLDIxLjQ0N2MuMDI1LjAyNy4wNS4wNTMuMDc3LjA3N2wxLjU0MSwxLjRhMS4xNjYsMS4xNjYsMCwwLDAsMS40ODkuMDY2TDkuNiwxOS45MzVaIiBzdHlsZT0iZmlsbDojMDA5YTdjIi8+PHBhdGggZD0iTTIxLjgzOCwyMS43NDksNS40MTIsOS4wMDdhMS4xNjUsMS4xNjUsMCwwLDAtMS40ODkuMDY2bC0xLjU0MSwxLjRhMS4xNjYsMS4xNjYsMCwwLDAtLjA3NywxLjY0N2MuMDI1LjAyNy4wNS4wNTMuMDc3LjA3N2wxNy45OSwxNi41YS44NzUuODc1LDAsMCwwLDEuNDY2LS42NDVaIiBzdHlsZT0iZmlsbDojMDBiMjk0Ii8+PHBhdGggZD0iTTIzLjI0NCwyOS43NDdhMS43NDUsMS43NDUsMCwwLDEtMS45ODktLjMzOEExLjAyNSwxLjAyNSwwLDAsMCwyMywyOC42ODRWMy4zMTZhMS4wMjUsMS4wMjUsMCwwLDAtMS43NDktLjcyNSwxLjc0NSwxLjc0NSwwLDAsMSwxLjk4OS0uMzM4bDUuNzY1LDIuNzcyQTEuNzQ4LDEuNzQ4LDAsMCwxLDMwLDYuNlYyNS40YTEuNzQ4LDEuNzQ4LDAsMCwxLS45OTEsMS41NzZaIiBzdHlsZT0iZmlsbDojMjRiZmE1Ii8+PC9zdmc+)](https://code.visualstudio.com)  
[![Gitleaks](https://img.shields.io/badge/protected%20by-gitleaks-blue?logo=git&logoColor=seagreen&color=seagreen)](https://github.com/zricethezav/gitleaks)

An OpenCode-native MCP server that gives your agents real-time web search via DeepSeek's server-side `web_search_20250305` tool. One tool call handles search, page fetch, decryption, and answer synthesis — no third-party search API required.

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
