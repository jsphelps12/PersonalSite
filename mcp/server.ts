// Local MCP server for posting to joshuaphelps.com.
//
// Every write tool validates against the site's own schemas, writes a
// Markdown/JSON file, and makes a local git commit. Nothing goes live until
// `publish` pushes to main, which Cloudflare deploys.
//
// Run: node mcp/server.ts (stdio). Registered for Claude Code in .mcp.json.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'astro/zod';
import { postSchema, takeSchema, shelfSchema, nowSchema } from '../src/content/schemas.ts';
import {
  CONTENT,
  commit,
  currentBranch,
  exists,
  freePath,
  listEntries,
  push,
  readEntry,
  slugify,
  today,
  unpushed,
  writeEntry,
  writeJson,
} from './repo.ts';

const NOW_FILE = 'src/data/now.json';
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const server = new McpServer({ name: 'joshuaphelps-site', version: '0.1.0' });

const ok = (text: string) => ({ content: [{ type: 'text' as const, text }] });
const fail = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });
type Result = ReturnType<typeof ok> | ReturnType<typeof fail>;

/** Run a tool body, turning thrown errors (schema, git, fs) into tool errors. */
function guarded<A>(fn: (args: A) => Result) {
  return async (args: A) => {
    try {
      return fn(args);
    } catch (error) {
      return fail(error instanceof Error ? error.message : String(error));
    }
  };
}

const committedNote = (sha: string) =>
  `Committed locally as ${sha}. Not live yet: call publish when the user wants it on the site.`;

server.registerTool(
  'list_content',
  {
    title: 'List site content',
    description:
      'List the newest entries in a content collection on joshuaphelps.com, with ids, dates and titles. Takes include their prediction status. Use this to find a take id before resolve_prediction, or to avoid posting duplicates.',
    inputSchema: {
      collection: z.enum(['posts', 'takes', 'projects', 'shelf']),
      limit: z.number().int().min(1).max(50).default(10),
    },
    annotations: { readOnlyHint: true },
  },
  guarded(({ collection, limit }) => {
    const rows = listEntries(collection).map(({ id, rel }) => {
      const { data, body } = readEntry(rel);
      const date = String(data.date ?? data.finished ?? '');
      const label = String(data.title ?? body.split('\n')[0].slice(0, 80));
      const pred = data.prediction as { claim?: string; outcome?: string } | undefined;
      const extra = pred ? ` [prediction: ${pred.outcome ?? 'pending'} - ${pred.claim}]` : '';
      const draft = data.draft ? ' [draft]' : '';
      return { date, line: `${id} | ${date} | ${label}${draft}${extra}` };
    });
    rows.sort((a, b) => b.date.localeCompare(a.date));
    const lines = rows.slice(0, limit).map((r) => r.line);
    return ok(lines.length ? lines.join('\n') : `No ${collection} yet.`);
  }),
);

server.registerTool(
  'post_take',
  {
    title: 'Post a take',
    description:
      "Write a short take (microblog post) for joshuaphelps.com, optionally with a prediction that gets scored later. Use the user's wording; tidy typos but don't rewrite their voice. Confidence is a probability from 0 to 1 that the claim comes true. Only include marketProb if the user gives a market or betting price.",
    inputSchema: {
      text: z.string().min(1).describe('The take itself, in Markdown. Usually one to three sentences.'),
      tags: z
        .array(z.string())
        .default([])
        .describe("Lowercase tags. Use 'sports' (plus e.g. 'soccer') for anything that should appear on /sports."),
      prediction: z
        .object({
          claim: z.string().describe('A specific, checkable statement, e.g. "Arsenal win the league in 2026-27".'),
          confidence: z.number().min(0).max(1),
          resolvesBy: isoDate.describe('The date by which the claim can be judged.'),
          marketProb: z.number().min(0).max(1).optional(),
        })
        .optional(),
    },
  },
  guarded(({ text, tags, prediction }) => {
    const date = today();
    const frontmatter = {
      date,
      tags,
      ...(prediction && { prediction: { ...prediction, outcome: 'pending' } }),
    };
    takeSchema.parse(frontmatter);
    const rel = freePath(`${CONTENT}/takes`, `${date}-${slugify(text, 6)}`);
    writeEntry(rel, frontmatter, text);
    const sha = commit([rel], `Take: ${text.slice(0, 60)}`);
    return ok(`Wrote ${rel}. ${committedNote(sha)}`);
  }),
);

server.registerTool(
  'resolve_prediction',
  {
    title: 'Resolve a prediction',
    description:
      "Mark a take's prediction as right, wrong or void once the outcome is known. Only the outcome and resolution date change: the claim, confidence and dates are locked so the ledger stays honest. Use list_content with collection 'takes' to find the id.",
    inputSchema: {
      id: z.string().describe('Take id, e.g. 2026-10-16-madrid-finish-above-barca'),
      outcome: z.enum(['right', 'wrong', 'void']),
    },
  },
  guarded(({ id, outcome }) => {
    const rel = `${CONTENT}/takes/${id}.md`;
    if (!exists(rel)) return fail(`No take with id ${id}. Use list_content to find it.`);
    const { data, body } = readEntry(rel);
    const prediction = data.prediction as Record<string, unknown> | undefined;
    if (!prediction) return fail(`Take ${id} has no prediction.`);
    if (prediction.outcome && prediction.outcome !== 'pending') {
      return fail(`Already resolved as ${prediction.outcome}. Resolutions are final; edit the file by hand if it was a mistake.`);
    }
    const updated = { ...data, prediction: { ...prediction, outcome, resolvedOn: today() } };
    takeSchema.parse(updated);
    writeEntry(rel, updated, body);
    const sha = commit([rel], `Resolve prediction (${outcome}): ${prediction.claim}`);
    return ok(`Marked "${prediction.claim}" as ${outcome}. ${committedNote(sha)}`);
  }),
);

server.registerTool(
  'add_to_shelf',
  {
    title: 'Add or update a shelf entry',
    description:
      "Add a book or film to the shelf, or update one already there (matched by title), e.g. moving it from 'want' to 'finished' with a rating. Ratings are out of 5 and may use halves.",
    inputSchema: {
      title: z.string(),
      creator: z.string().describe('Author for books, director for films.'),
      kind: z.enum(['book', 'film']),
      status: z.enum(['want', 'in-progress', 'finished', 'abandoned']),
      rating: z.number().min(0).max(5).optional(),
      oneLiner: z.string().optional().describe("The user's one-sentence take, in their words."),
      finished: isoDate.optional().describe('Defaults to today when status is finished.'),
    },
  },
  guarded((input) => {
    const rel = `${CONTENT}/shelf/${slugify(input.title)}.md`;
    const existed = exists(rel);
    const previous = existed ? readEntry(rel).data : {};
    const frontmatter = Object.fromEntries(
      Object.entries({
        ...previous,
        ...input,
        finished: input.finished ?? (input.status === 'finished' ? (previous.finished ?? today()) : previous.finished),
      }).filter(([, v]) => v !== undefined),
    );
    shelfSchema.parse(frontmatter);
    writeEntry(rel, frontmatter);
    const sha = commit([rel], `Shelf: ${existed ? 'update' : 'add'} ${input.title}`);
    return ok(`${existed ? 'Updated' : 'Added'} ${input.title} (${rel}). ${committedNote(sha)}`);
  }),
);

server.registerTool(
  'draft_post',
  {
    title: 'Draft a long-form post',
    description:
      'Create a long-form post as a draft (hidden from the site until the user flips draft to false and publishes). Use for essays, soccer analysis and trip reports. The body should be what the user wrote or dictated; outline gaps as TODOs rather than inventing facts, numbers or experiences.',
    inputSchema: {
      title: z.string(),
      description: z.string().describe('One sentence shown in listings and RSS.'),
      category: z.enum(['tech', 'ml', 'sports', 'adventure', 'life']),
      tags: z.array(z.string()).default([]),
      body: z.string().describe('Markdown body.'),
      trip: z
        .object({
          location: z.string(),
          summitFt: z.number().optional(),
          gainFt: z.number().optional(),
          miles: z.number().optional(),
        })
        .optional()
        .describe('Only for adventure posts, and only with numbers the user gave.'),
    },
  },
  guarded(({ title, description, category, tags, body, trip }) => {
    const frontmatter = { title, description, date: today(), category, tags, draft: true, ...(trip && { trip }) };
    postSchema.parse(frontmatter);
    const rel = freePath(`${CONTENT}/posts`, slugify(title));
    writeEntry(rel, frontmatter, body);
    const sha = commit([rel], `Draft post: ${title}`);
    return ok(`Drafted ${rel} (draft: true, so it stays hidden even after publishing). ${committedNote(sha)}`);
  }),
);

server.registerTool(
  'update_now',
  {
    title: 'Update the /now page',
    description:
      "Replace the bullet list on the /now page with what the user is focused on now. Pass the full new list, keeping any existing items the user still wants.",
    inputSchema: { items: z.array(z.string().min(1)).min(1) },
  },
  guarded(({ items }) => {
    const data = { updated: today(), items };
    nowSchema.parse(data);
    writeJson(NOW_FILE, data);
    const sha = commit([NOW_FILE], 'Update /now');
    return ok(`Updated /now with ${items.length} items. ${committedNote(sha)}`);
  }),
);

server.registerTool(
  'publish',
  {
    title: 'Publish to joshuaphelps.com',
    description:
      'Push local commits to GitHub, which deploys them to the live site within a couple of minutes. Only call this when the user explicitly asks to publish or post it live. With dryRun true it just lists what would go live.',
    inputSchema: { dryRun: z.boolean().default(false) },
    annotations: { destructiveHint: false, openWorldHint: true },
  },
  guarded(({ dryRun }) => {
    const branch = currentBranch();
    if (branch !== 'main') return fail(`On branch ${branch}; only main deploys. Switch to main first.`);
    const pending = unpushed();
    if (!pending.length) return ok('Nothing to publish: the live site is up to date.');
    const list = pending.map((c) => `  ${c}`).join('\n');
    if (dryRun) return ok(`These ${pending.length} commits would go live:\n${list}`);
    push();
    return ok(`Published ${pending.length} commits. joshuaphelps.com updates in a minute or two:\n${list}`);
  }),
);

await server.connect(new StdioServerTransport());
