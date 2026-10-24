// Josh's "player profile" for the home page.
//
// Self-scouted ratings, roles and scout report. Ratings are 1–20, Football
// Manager style, and more fun than accurate.
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
  // Flip to true to label the ratings, roles and scout report as drafts.
  placeholder: false,
  name: 'Joshua Phelps',
  position: 'Applied AI Engineer',
  facts: [
    { label: 'Position', value: 'Applied AI' },
    { label: 'Preferred foot', value: 'Python' },
    { label: 'Club', value: 'Utah State' },
    { label: 'Status', value: 'Building' },
  ],
  // Positions on the mini pitch. x/y are 0–100 across a horizontal pitch,
  // attacking to the right.
  roles: [
    { code: 'ST', label: 'Applied AI', level: 'Natural', x: 86, y: 50 },
    { code: 'AM', label: 'Product', level: 'Accomplished', x: 68, y: 34 },
    { code: 'CM', label: 'Software Engineer', level: 'Natural', x: 50, y: 62 },
  ],
  attributes: {
    Technical: [
      { name: 'Python', rating: 16, evidence: ['python'] },
      { name: 'Machine Learning', rating: 15, evidence: ['ml'] },
      { name: 'LLM Apps', rating: 14, evidence: ['llm'] },
      { name: 'Agentic Coding', rating: 16, evidence: ['ai-agents'] },
      { name: 'Evals', rating: 12, evidence: ['evals'] },
      { name: 'Backend & Systems', rating: 15, evidence: ['fintech'] },
      { name: 'Web & Mobile', rating: 14, evidence: ['astro', 'typescript', 'web', 'mobile'] },
    ],
    Mental: [
      { name: 'Decisions', rating: 16, evidence: ['predictions'] },
      { name: 'Vision', rating: 17, evidence: ['analysis'] },
      { name: 'Ownership', rating: 17, evidence: [] },
      { name: 'Communication', rating: 16, evidence: [] },
      { name: 'Teamwork', rating: 16, evidence: [] },
      { name: 'Opinions', rating: 19, evidence: ['soccer', 'tech'] },
      { name: 'Humility', rating: 13, evidence: [] },
    ],
    Physical: [
      { name: 'Stamina', rating: 16, evidence: ['climbing'] },
      { name: 'Altitude', rating: 15, evidence: ['climbing', 'wyoming'] },
      { name: 'Recovery', rating: 11, evidence: [] },
      { name: 'Footwork', rating: 8, evidence: [] },
    ],
  } satisfies Record<string, Attribute[]>,
  scoutReport:
    "Two-way engineer who's as comfortable owning the product call as writing the code. Thrives in cross-functional teams and can explain a tradeoff to a stakeholder without losing them. Learns new domains fast: went from zero to shipping a regulated money-movement system in three months.",
  // Career so far, FM transfer-history style. Shown on the About page.
  history: [
    { years: '–2026', club: 'BYU', move: 'Academy graduate' },
    { years: '2024', club: 'Cadence Design Systems', move: 'Loan' },
    { years: '2024–25', club: 'CompliRent', move: 'Co-founder' },
    { years: '2025', club: 'Amazon', move: 'Loan' },
    { years: '2026', club: 'Puente Financial', move: 'Co-founder' },
    { years: '2026–', club: 'Utah State', move: 'Transfer (MS, May 2027)' },
  ],
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
