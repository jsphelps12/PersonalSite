// Frontmatter schemas for every content collection. Shared by the Astro
// site (src/content.config.ts) and the posting MCP server (mcp/), so the
// server can never write a file the site would reject.
import { z } from 'astro/zod';

// Long-form writing: tech/ML essays, soccer analysis, trip reports.
export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.enum(['tech', 'ml', 'sports', 'adventure', 'life']),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // Only for adventure posts.
  trip: z
    .object({
      location: z.string(),
      summitFt: z.number().optional(),
      gainFt: z.number().optional(),
      miles: z.number().optional(),
      gpx: z.string().optional(),
    })
    .optional(),
});

// Microblog. A take can carry a prediction, which feeds the future ledger.
export const takeSchema = z.object({
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  prediction: z
    .object({
      claim: z.string(),
      confidence: z.number().min(0).max(1),
      resolvesBy: z.coerce.date(),
      outcome: z.enum(['pending', 'right', 'wrong', 'void']).default('pending'),
      resolvedOn: z.coerce.date().optional(),
      // Snapshotted at posting time; hotness compares against this.
      marketProb: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  status: z.enum(['idea', 'building', 'shipped', 'archived']),
  stack: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  repo: z.url().optional(),
  url: z.url().optional(),
  featured: z.boolean().default(false),
});

// Books and films.
export const shelfSchema = z.object({
  title: z.string(),
  creator: z.string(),
  kind: z.enum(['book', 'film']),
  status: z.enum(['want', 'in-progress', 'finished', 'abandoned']),
  rating: z.number().min(0).max(5).optional(),
  oneLiner: z.string().optional(),
  finished: z.coerce.date().optional(),
});

// The /now page.
export const nowSchema = z.object({
  updated: z.coerce.date(),
  items: z.array(z.string()).min(1),
});
