// Local MCP server for posting to joshuaphelps.com.
//
// Every write tool validates against the site's own schemas, writes a
// Markdown/JSON file, and makes a local git commit. Nothing goes live until
// `publish` pushes to main, which Cloudflare deploys.
//
// Prompts (trip-report, project-writeup) are guided interviews that end in a
// draft; in Claude Code they appear as slash commands.
//
// Run: node mcp/server.ts (stdio). Registered for Claude Code in .mcp.json.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'astro/zod';
import { stringify } from 'yaml';
import { postSchema, takeSchema, projectSchema, shelfSchema, nowSchema } from '../src/content/schemas.ts';
import {
  CONTENT,
  commit,
  currentBranch,
  exists,
  findEntry,
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
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((i) => `- ${i.path.join('.') || '(entry)'}: ${i.message}`);
        return fail(`Not saved, the entry wouldn't be valid:\n${issues.join('\n')}`);
      }
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
  'draft_project',
  {
    title: 'Draft a project writeup',
    description:
      "Create a project case study as a draft (hidden until draft is set to false with update_entry and published). Structure the body as Problem, Approach, Evaluation, What failed, What's next. Use only facts, numbers and results the user gave; mark gaps as TODOs.",
    inputSchema: {
      title: z.string(),
      description: z.string().describe('One sentence: what it is and why it matters.'),
      status: z.enum(['idea', 'building', 'shipped', 'archived']),
      stack: z.array(z.string()).default([]),
      tags: z
        .array(z.string())
        .default([])
        .describe('Lowercase skill tags (e.g. python, ml, evals, llm). These link the project to ratings on the home page.'),
      repo: z.url().optional(),
      url: z.url().optional(),
      body: z.string().describe('Markdown body.'),
    },
  },
  guarded(({ body, ...fields }) => {
    const frontmatter = Object.fromEntries(
      Object.entries({ ...fields, date: today(), draft: true }).filter(([, v]) => v !== undefined),
    );
    projectSchema.parse(frontmatter);
    const rel = freePath(`${CONTENT}/projects`, slugify(fields.title));
    writeEntry(rel, frontmatter, body);
    const sha = commit([rel], `Draft project: ${fields.title}`);
    return ok(`Drafted ${rel} (draft: true, so it stays hidden even after publishing). ${committedNote(sha)}`);
  }),
);

server.registerTool(
  'get_entry',
  {
    title: 'Read an entry in full',
    description:
      'Read one post, take, project or shelf entry in full: its frontmatter and Markdown body. Use before update_entry so edits start from the current text. Find ids with list_content.',
    inputSchema: {
      collection: z.enum(['posts', 'takes', 'projects', 'shelf']),
      id: z.string(),
    },
    annotations: { readOnlyHint: true },
  },
  guarded(({ collection, id }) => {
    const rel = findEntry(collection, id);
    if (!rel) return fail(`No ${collection} entry with id ${id}. Use list_content to find it.`);
    const { data, body } = readEntry(rel);
    return ok(`${rel}\n\n---\n${stringify(data, { lineWidth: 0 }).trimEnd()}\n---\n\n${body || '(empty body)'}`);
  }),
);

server.registerTool(
  'update_entry',
  {
    title: 'Edit a post or project',
    description:
      "Edit an existing post or project: any frontmatter fields and/or the body. Pass only what changes; body replaces the whole body, so read it with get_entry first. Set draft to false to make a draft public (it goes live on the next publish). Takes and predictions can't be edited here, by design.",
    inputSchema: {
      collection: z.enum(['posts', 'projects']),
      id: z.string(),
      fields: z
        .record(z.string(), z.unknown())
        .default({})
        .describe('Frontmatter fields to set, e.g. {"draft": false} or {"title": "..."}. Use null to remove an optional field.'),
      body: z.string().optional().describe('New Markdown body, replacing the old one.'),
    },
  },
  guarded(({ collection, id, fields, body }) => {
    const rel = findEntry(collection, id);
    if (!rel) return fail(`No ${collection} entry with id ${id}. Use list_content to find it.`);
    if ('date' in fields) return fail('The original date is fixed. An "updated" date is set automatically on edits to public posts.');
    const current = readEntry(rel);
    const merged: Record<string, unknown> = { ...current.data, ...fields };
    for (const [key, value] of Object.entries(merged)) if (value === null) delete merged[key];
    const wasPublic = current.data.draft !== true;
    if (collection === 'posts' && wasPublic && body !== undefined && body.trim() !== current.body) {
      merged.updated = today();
    }
    (collection === 'posts' ? postSchema : projectSchema).parse(merged);
    writeEntry(rel, merged, body ?? current.body);
    const goingPublic = !wasPublic && merged.draft === false;
    const title = String(merged.title ?? id);
    const sha = commit([rel], `${goingPublic ? 'Undraft' : 'Edit'} ${collection === 'posts' ? 'post' : 'project'}: ${title}`);
    const note = goingPublic ? ' It is no longer a draft, so it will appear on the site after publish.' : '';
    return ok(`Updated ${rel}.${note} ${committedNote(sha)}`);
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

const interview = (text: string) => ({
  messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }],
});

const INTERVIEW_RULES = `How to run this:
- Ask one or two questions at a time, conversationally. Follow up on anything vague or interesting; the best material is usually in the follow-up.
- Use my words. Tidy grammar, but keep my voice, jokes and opinions. Never invent facts, numbers, names or experiences; if something is missing, ask or leave a TODO.
- When you have enough, show me the full draft in chat and ask for changes before saving anything.
- Save only after I approve. It stays a draft, and nothing goes live until I ask you to publish.`;

server.registerPrompt(
  'trip-report',
  {
    title: 'Write a trip report',
    description: 'Interview me about a trip or climb, then draft an adventure post with the trip stats.',
    argsSchema: { trip: z.string().optional().describe('Which trip, e.g. "Grand Teton"') },
  },
  ({ trip }) =>
    interview(`Help me write a trip report for my site${trip ? ` about ${trip}` : ''}.

First, call list_content for posts to check whether a post for this trip already exists (there may be a SAMPLE placeholder). If it does, we'll replace that post's body and fields with update_entry instead of creating a new one.

Interview me to get:
1. Where and when, who I went with, and why this trip.
2. How I prepared, and what I was worried about going in.
3. The route, told as a story: the approach, the crux, the moment it got real.
4. What went wrong or surprised me.
5. The summit or high point: what it was actually like.
6. Stats, only the ones I actually know: summit elevation (ft), elevation gain (ft), distance (mi).
7. What I'd tell someone attempting it, and whether I'd go back.

Write it as a first-person story, not a guidebook. Put stats in the trip fields, not repeated in the prose. Suggest a title and a one-sentence description that make someone want to read it. Leave [PHOTO: description] markers where photos would help.

Save with draft_post (category: adventure, with trip stats and a few lowercase tags), or update_entry if a post already exists.

${INTERVIEW_RULES}`),
);

server.registerPrompt(
  'project-writeup',
  {
    title: 'Write a project case study',
    description: 'Interview me about a project, then draft a case-study writeup aimed at applied AI hiring managers.',
    argsSchema: { project: z.string().optional().describe('Which project') },
  },
  ({ project }) =>
    interview(`Help me write a project case study for my site${project ? ` about ${project}` : ''}. The main readers are hiring managers for applied AI roles: they care about judgment, evaluation and honesty about tradeoffs more than polish.

First, call list_content for projects to check whether one already exists. If it does, read it with get_entry and we'll update it with update_entry instead of creating a new one.

Interview me to get:
1. The problem: what I wanted, for whom, and why it was worth doing.
2. The approach: what I built, the key decisions, and the alternatives I considered and rejected (and why).
3. Evaluation: how I knew it worked. Metrics, baselines, evals, test sets, user feedback. Real numbers only; if I didn't measure something, say so plainly.
4. What failed: dead ends, bugs that taught me something, things I'd do differently.
5. Status and next steps.
6. Stack, a repo link and a live link if they exist.

Structure the body with these sections: ## Problem, ## Approach, ## Evaluation, ## What failed, ## What's next. Open with a two-sentence summary that states the result. Suggest lowercase skill tags (e.g. python, ml, evals, llm, data, web): they link this project to the attribute ratings on my home page.

Save with draft_project, or update_entry if the project already exists.

${INTERVIEW_RULES}`),
);

await server.connect(new StdioServerTransport());
