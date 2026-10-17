import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, takeSchema, projectSchema, shelfSchema } from './content/schemas';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: postSchema,
});

const takes = defineCollection({
  loader: glob({ base: './src/content/takes', pattern: '**/*.md' }),
  schema: takeSchema,
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: projectSchema,
});

const shelf = defineCollection({
  loader: glob({ base: './src/content/shelf', pattern: '**/*.md' }),
  schema: shelfSchema,
});

export const collections = { posts, takes, projects, shelf };
