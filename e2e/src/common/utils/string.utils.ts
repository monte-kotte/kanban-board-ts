/**
 * Generates a short, process-unique suffix so builders can produce data that
 * never collides across parallel workers or repeated runs against a shared DB.
 */
let counter = 0;

export function unique(prefix: string): string {
  counter += 1;
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${stamp}-${counter}${rand}`;
}
