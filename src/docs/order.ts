/** Sidebar order. A guide not listed here still shows, after these, alphabetically. */
export const DOC_ORDER = [
  'overview',
  'skills',
  'init',
  'interview',
  'config',
  'mcp',
  'dashboard',
  'accounts',
  'sync',
  'hub',
  'doctor',
  'orca',
];

export function orderedSlugs(available: string[]): string[] {
  const known = DOC_ORDER.filter((s) => available.includes(s));
  const rest = available.filter((s) => !DOC_ORDER.includes(s)).sort();
  return [...known, ...rest];
}
