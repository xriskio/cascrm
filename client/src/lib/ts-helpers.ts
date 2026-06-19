/**
 * Custom implementation of TypeScript's __rest helper
 */
export function __rest(s: any, e: string[]) {
  const t: any = {}
  for (const p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p]
  }
  return t
}
