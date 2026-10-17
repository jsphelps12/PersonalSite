# joshuaphelps.com

Personal site: writing, soccer takes and analysis, projects, and a shelf of books and films.

## Develop

```bash
pnpm install
pnpm dev
```

`pnpm build` outputs a static site to `dist/`. `pnpm deploy` builds and ships it to Cloudflare via Wrangler.

## Content

Everything lives in `src/content/` as Markdown, validated by schemas in `src/content.config.ts`.

| Folder | What | Shows up on |
|---|---|---|
| `posts/` | Long-form writing (`category`: tech, ml, sports, adventure, life). Trip stats go in `trip`. | `/writing`, `/sports`, RSS |
| `takes/` | Microblog posts, optionally with a `prediction` for the ledger | `/takes`, `/sports` (if tagged `sports`), home |
| `projects/` | Case-study project writeups | `/projects` |
| `shelf/` | Books and films | `/shelf` |

Set `draft: true` on a post to hide it. The /now page reads `src/data/now.json`.

## Posting with Claude (MCP server)

`mcp/server.ts` is a local MCP server, registered for Claude Code in `.mcp.json`. Open Claude Code in this repo, approve the `site` server once, then just ask, e.g. "post a take: ... 60% confident, resolves end of season".

| Tool | What it does |
|---|---|
| `list_content` | Newest entries in a collection, with take ids and prediction status |
| `post_take` | New take, optionally with a prediction |
| `resolve_prediction` | Set a prediction to right / wrong / void (claim and confidence stay locked) |
| `add_to_shelf` | Add or update a book or film |
| `draft_post` | New long-form post with `draft: true` |
| `update_now` | Replace the /now list |
| `publish` | Push to main, which deploys. `dryRun` lists what would go live. |

Every write validates against `src/content/schemas.ts` (the same schemas the site uses) and makes a local commit of just that file. Nothing is live until `publish`. Check types with `pnpm mcp:check`.

## Roadmap

- Predictions ledger (calibration, market comparison, AI hotness score)
- JoshGPT
- Ask the site (RAG over the content)
- Soccer viz components (radar/pizza charts, heat maps)
