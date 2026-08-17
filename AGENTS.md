# AGENTS.md

## Cursor Cloud specific instructions

This repo is primarily a **pnpm monorepo** for an "Auto-Trading Analyst Dashboard". It also contains an unrelated, secondary Java reactive-streams example (`pom.xml`, `src/main/java`) that is not part of the dashboard product.

### Layout (pnpm workspace)
- `apps/web` — React Router 7 SPA (the dashboard UI). Dev server on port `5173`.
- `apps/api` — NestJS API (AI services via LangChain/OpenAI, Playwright scraper). Intended to listen on port `3000`.
- `packages/shared` — shared Zod schemas, built with `tsup`. Both apps import it as `@my-org/shared` (`workspace:*`).

### Build / run (standard scripts, see root `package.json` and each app's `package.json`)
- `packages/shared` MUST be built before running/building the apps, since they consume its compiled `dist/`. The update script handles this. If you change `packages/shared`, rebuild it: `pnpm --filter @my-org/shared build` (or run `pnpm --filter @my-org/shared dev` for watch mode).
- Web dev: `pnpm --filter @my-org/web dev` → http://localhost:5173
- API dev: `pnpm --filter @my-org/api dev` (`nest start --watch`)
- Tests: `pnpm test` (vitest; only `apps/api` currently has tests, all passing).
- Lint: `pnpm lint` (biome), Format: `pnpm format`.

### Known pre-existing issues (NOT environment problems — do not "fix" as part of setup)
- **API does not compile / start.** `apps/api` source uses the modern `@langchain/openai` API (`new ChatOpenAI({ model })` and `withStructuredOutput`), but `apps/api/package.json` pins `@langchain/openai@^0.0.1` (resolves to `0.0.1`), which lacks those. `nest start --watch` reports 4 TypeScript errors and never binds port `3000`. Fixing requires bumping the LangChain deps (a code/dependency change), which is out of scope for environment setup.
- **`pnpm lint` fails on config.** `biome.json` is written for the Biome 1.5.x schema (top-level `organizeImports`), but the pinned `@biomejs/biome` is `latest` (2.4.4), which rejects `organizeImports`. Running lint surfaces a config error until `biome.json` is migrated to 2.x (move `organizeImports` under `assist`).
- The AI endpoints, even once compiling, need an `OPENAI_API_KEY` and the `macro-regime` endpoint additionally needs Playwright browsers (`pnpm --filter @my-org/api exec playwright install chromium`).
- The Java example needs Maven, which is not installed (Java 21 is). It is not part of the dashboard product.

### Verified working in dev
- `pnpm install`, `pnpm --filter @my-org/shared build`, `pnpm test` (7 tests pass), and the web dashboard at `/` and `/dashboard`.
