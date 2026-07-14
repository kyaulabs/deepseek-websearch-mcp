# @kyaulabs/deepseek-websearch

An MCP server that provides web search capabilities powered by DeepSeek's native web search API. Designed for OpenCode, compatible with any MCP client (Cursor, Claude Code, Continue, etc.).

## Features

- 🔍 **DeepSeek Native Search** — Uses the server-side `web_search_20250305` tool, no third-party search API needed
- 📝 **AI-Generated Answers** — Returns detailed answers synthesized from full page content, not just URLs
- 🔗 **Source URLs Included** — Every answer comes with original source links for verification
- ⚙️ **Flexible Configuration** — Env vars + optional JSON config file, model selection, thinking mode toggle
- 🌐 **MCP Protocol** — Standard JSON-RPC over stdio, compatible with all MCP clients
- 🧪 **Well-Tested** — Full unit test suite + gated integration tests

## Quick Start

### 1. Get a DeepSeek API Key

Visit [DeepSeek Platform](https://platform.deepseek.com/) to sign up and get your API Key.

### 2. Configure Your MCP Client

#### OpenCode

Add to your `opencode.json`:

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

#### Claude Code

Edit `.mcp.json` in your project:

```json
{
  "mcpServers": {
    "deepseek-websearch": {
      "command": "npx",
      "args": ["@kyaulabs/deepseek-websearch"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

#### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "deepseek-websearch": {
      "command": "npx",
      "args": ["@kyaulabs/deepseek-websearch"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### 3. Start Using It

Restart your AI assistant and ask a question that needs real-time information:

- "What's new in React 19?"
- "Search for the latest Node.js LTS version"
- "What are the latest TypeScript features?"

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | ✅ Yes | — | DeepSeek API Key |
| `WEBSEARCH_API_KEY` | ❌ | — | Fallback API key variable |
| `WEBSEARCH_MODEL` | ❌ | `deepseek-v4-flash` | Model: `deepseek-v4-flash` (fast) or `deepseek-v4-pro` (powerful) |
| `WEBSEARCH_THINKING` | ❌ | `enabled` | Thinking mode: `enabled` / `disabled` |
| `WEBSEARCH_MAX_TOKENS` | ❌ | `32768` | Max tokens for response |
| `WEBSEARCH_BASE_URL` | ❌ | `https://api.deepseek.com/anthropic` | API base URL override |

### JSON Config File

Optionally create `~/.deepseek-websearch.json`:

```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxx",
  "model": "deepseek-v4-pro",
  "thinking": "disabled",
  "maxTokens": 16384
}
```

Environment variables override the config file.

## How It Works

```
User Query → MCP Server → DeepSeek API (web_search_20250305 tool)
                                ↓
                    Server-side: search → fetch pages → decrypt → synthesize
                                ↓
                    Returns: AI answer + source URLs
```

One MCP tool call = one DeepSeek API request. Search, decryption, and answer generation all happen on DeepSeek's infrastructure.

## Development

```bash
npm install          # install dependencies
npm test             # run unit tests
npm run test:integration  # run integration tests (requires DEEPSEEK_API_KEY)
npm run build        # compile TypeScript
npm run check        # type-check without emitting
```

## License

MIT © KYAULabs
