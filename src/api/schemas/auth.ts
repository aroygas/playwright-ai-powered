import { z } from 'zod';

export const AuthTokenSchema = z.object({ token: z.string().min(1) });
export type AuthToken = z.infer<typeof AuthTokenSchema>;
