import type { z } from 'zod';

const MAX_PAYLOAD_CHARS = 1500;

/**
 * Validates `data` against `schema` and returns the parsed value.
 * On mismatch throws an error listing every issue (path + message) and the received payload.
 */
export function expectSchema<S extends z.ZodType>(
  schema: S,
  data: unknown,
  label = 'response',
): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const issues = result.error.issues
    .map((i) => `  - ${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`)
    .join('\n');
  const payload = JSON.stringify(data, null, 2) ?? String(data);
  const shown =
    payload.length > MAX_PAYLOAD_CHARS
      ? `${payload.slice(0, MAX_PAYLOAD_CHARS)}\n...(truncated)`
      : payload;
  throw new Error(`Schema contract violation in ${label}:\n${issues}\nReceived:\n${shown}`);
}
