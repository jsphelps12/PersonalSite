import { getCollection } from 'astro:content';

const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) =>
  b.data.date.valueOf() - a.data.date.valueOf();

export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort(byDateDesc);
}

export async function getTakes() {
  return (await getCollection('takes')).sort(byDateDesc);
}

export async function getProjects() {
  return (await getCollection('projects')).sort(byDateDesc);
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** First line of a take's Markdown body, as plain text, for listings. */
export function takeSummary(body = '', max = 90) {
  const text = body
    .replace(/[`*_>#[\]]/g, '')
    .replace(/\(([^)]*)\)/g, '')
    .trim()
    .split('\n')[0];
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export interface Evidence {
  title: string;
  href: string;
  kind: 'Post' | 'Project' | 'Take';
}

/** Content that backs up a profile attribute, matched by tag. */
export async function getEvidenceIndex() {
  const [posts, projects, takes] = await Promise.all([getPosts(), getProjects(), getTakes()]);
  const items: { tags: string[]; evidence: Evidence }[] = [
    ...posts.map((p) => ({
      tags: [p.data.category, ...p.data.tags],
      evidence: { title: p.data.title, href: `/writing/${p.id}`, kind: 'Post' as const },
    })),
    ...projects.map((p) => ({
      tags: [...p.data.tags, ...p.data.stack.map((s) => s.toLowerCase())],
      evidence: { title: p.data.title, href: `/projects/${p.id}`, kind: 'Project' as const },
    })),
    ...takes.map((t) => ({
      tags: [...t.data.tags, ...(t.data.prediction ? ['predictions'] : [])],
      evidence: { title: takeSummary(t.body, 60), href: `/takes#${t.id}`, kind: 'Take' as const },
    })),
  ];
  return (wanted: string[]) =>
    items.filter((item) => item.tags.some((tag) => wanted.includes(tag))).map((item) => item.evidence);
}

/** Prediction record across all takes. */
export async function getPredictionForm() {
  const takes = await getTakes();
  const predictions = takes.filter((t) => t.data.prediction).map((t) => ({ id: t.id, ...t.data.prediction! }));
  const count = (o: string) => predictions.filter((p) => p.outcome === o).length;
  return {
    recent: predictions.slice(0, 5),
    right: count('right'),
    wrong: count('wrong'),
    pending: count('pending'),
    void: count('void'),
  };
}
