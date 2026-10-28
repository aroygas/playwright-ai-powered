import type { ApiClient } from '@api/client/ApiClient';
import type { AuthToken } from '@api/schemas/auth';

export class AuthService {
  constructor(private readonly client: ApiClient) {}

  /** Returns a token body on success; `{ reason }` (HTTP 200) on bad credentials. */
  login(username: string, password: string) {
    return this.client.post<AuthToken | { reason: string }>('/auth', {
      data: { username, password },
    });
  }
}
