// Josh's "player profile" for the home page.
//
// TODO(josh): every rating, role and line of scout-report copy below is a
// placeholder drafted during the design pass. Replace them with your own
// honest self-assessment. Ratings are 1–20, Football Manager style.
//
// `evidence` lists the content tags that back a rating up. Posts, projects
// and takes carrying any of those tags show up as evidence on the home page;
// a rating with none reads "Unverified".

export interface Attribute {
  name: string;
  rating: number;
  evidence: string[];
}

export const profile = {
  // Flip to false once the ratings, roles and scout report are really yours.
  // While true, the home page labels them as placeholders.
  placeholder: true,
  name: 'Joshua Phelps',
  position: 'Applied AI Engineer',
  facts: [
    { label: 'Position', value: 'Applied AI' },
    { label: 'Preferred foot', value: 'Python' },
    { label: 'Club', value: 'joshuaphelps.com' },
    { label: 'Status', value: 'Scouting applied AI roles' },
  ],
  // Positions on the mini pitch. x/y are 0–100 across a horizontal pitch,
  // attacking to the right.
  roles: [
    { code: 'ST', label: 'Applied AI', level: 'Natural', x: 86, y: 50 },
    { code: 'AM', label: 'Soccer analytics', level: 'Accomplished', x: 68, y: 38 },
    { code: 'DM', label: 'Hot takes', level: 'Unconvincing', x: 36, y: 62 },
  ],
  attributes: {
    Technical: [
      { name: 'Python', rating: 15, evidence: ['python'] },
      { name: 'Machine Learning', rating: 13, evidence: ['ml'] },
      { name: 'Evals', rating: 12, evidence: ['evals'] },
      { name: 'LLM Apps', rating: 14, evidence: ['llm'] },
      { name: 'Data Wrangling', rating: 14, evidence: ['data', 'analysis'] },
      { name: 'Web', rating: 12, evidence: ['astro', 'typescript', 'web'] },
    ],
    Mental: [
      { name: 'Decisions', rating: 14, evidence: ['predictions'] },
      { name: 'Vision', rating: 15, evidence: ['analysis'] },
      { name: 'Opinions', rating: 19, evidence: ['soccer', 'tech'] },
      { name: 'Humility', rating: 11, evidence: [] },
      { name: 'Work Rate', rating: 16, evidence: [] },
    ],
    Physical: [
      { name: 'Stamina', rating: 16, evidence: ['climbing'] },
      { name: 'Altitude', rating: 15, evidence: ['climbing', 'wyoming'] },
      { name: 'Recovery', rating: 11, evidence: [] },
    ],
  } satisfies Record<string, Attribute[]>,
  scoutReport:
    "Applied AI engineer who'd rather show you the eval than the demo. Builds things to answer questions they actually have, then writes up what broke. Strong opinions on soccer, logged publicly and scored. Known to make a chart out of anything.",
};

export function band(rating: number) {
  if (rating >= 16) return 'elite';
  if (rating >= 11) return 'good';
  if (rating >= 6) return 'mid';
  return 'low';
}

/** FM shows unscouted attributes as a range. So do we, until there's evidence. */
export function bandRange(rating: number) {
  if (rating >= 16) return '16–20';
  if (rating >= 11) return '11–15';
  if (rating >= 6) return '6–10';
  return '1–5';
}
