# @kyaulabs/deepseek-websearch Implementation Plan

> **For agentic workers:** Implement this plan task-by-task using TDD.
> Each task follows Red → Green → Refactor.

**Goal:** Build a standalone TypeScript MCP server that exposes a `web_search` tool powered by DeepSeek's Anthropic-compatible endpoint.

**Architecture:** Stdio MCP server using `@modelcontextprotocol/sdk`. Core search logic is framework-agnostic (`search.ts`), separated from the MCP protocol layer (`index.ts`). Config cascades: defaults → JSON file → env vars → programmatic.

**Tech Stack:** TypeScript 5.8+ (strict, ESM, NodeNext), `@modelcontextprotocol/sdk`, Vitest 3+, Node 20+

## Global constraints

- **Node:** >= 20.0.0
- **TypeScript:** `strict: true`, `module: "NodeNext"`
- **Indentation:** 4-space (TS)
- **Module system:** ESM only (`"type": "module"`)
- **System prompt placement:** Top-level `system` parameter (Anthropic format), NOT in messages array

---

### Task 0: Project Scaffolding

- [ ] Create project directory, package.json, tsconfig.json, vitest configs, .gitignore, LICENSE
- [ ] Create `src/types.ts` with shared interfaces
- [ ] `npm install`, verify `tsc --noEmit`

### Task 1: Error Classes (`errors.ts`)

- [ ] Write `tests/errors.test.ts` — construction, codes, statusCode, instanceof, stack trace
- [ ] Implement `src/errors.ts` — `SearchErrorCode` enum + `SearchError` class

### Task 2: Config Loader (`config.ts`)

- [ ] Write `tests/config.test.ts` — defaults, env vars (all 6), fallback chain, merge cascade, MISSING_API_KEY
- [ ] Implement `src/config.ts` — `loadConfig()` with file → env → defaults merge

### Task 3: Core Search Logic (`search.ts`)

- [ ] Write `tests/search.test.ts` — request body structure, system placement, tool declaration, thinking config, response parsing, error codes (429, 401, network, cancel), missing key
- [ ] Implement `src/search.ts` — `searchWeb(query, options?)` with mockable fetch

### Task 4: Output Formatter (`format.ts`)

- [ ] Write `tests/format.test.ts` — no-results, answer-only, sources-only, both, page_age, markdown structure
- [ ] Implement `src/format.ts` — `formatResults(query, response)`, `formatError(error)`

### Task 5: MCP Server (`index.ts`)

- [ ] Write `tests/index.test.ts` — tool registration, call handling, error formatting
- [ ] Implement `src/index.ts` — `createServer()` factory + stdio entry point

### Task 6: Integration Test + README

- [ ] Write `tests/integration.test.ts` (gated on `DEEPSEEK_API_KEY`)
- [ ] Write `README.md`
- [ ] Run full suite with coverage, verify `npm run build`

### Task 7: Final Verification

- [ ] `npm run check` + `npm test` + `npm run build` — all green
- [ ] Tag v1.0.0
