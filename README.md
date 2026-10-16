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

Set `draft: true` on a post to hide it.

## Roadmap

- Real design pass
- Predictions ledger (calibration, market comparison, AI hotness score)
- JoshGPT
- MCP server for posting
- Ask the site (RAG over the content)
- Soccer viz components (radar/pizza charts, heat maps)
