Target: `src/api/services/<Name>Service.ts` + `src/api/schemas/<name>.ts` + fixture in `src/fixtures/api.fixtures.ts`.

```ts
// src/api/schemas/<name>.ts
import { z } from 'zod';

export const <Name>Schema = z.object({ id: z.number(), name: z.string() });
export type <Name> = z.infer<typeof <Name>Schema>;
```

```ts
// src/api/services/<Name>Service.ts
import type { ApiClient } from '@api/client/ApiClient';
import type { <Name> } from '@api/schemas/<name>';

/** Thin wrapper over /<resource>. Returns responses; never asserts. */
export class <Name>Service {
  constructor(private readonly client: ApiClient) {}

  get(id: number) {
    return this.client.get<<Name>>(`/<resource>/${id}`);
  }
  create(body: <Name>) {
    return this.client.post<<Name>>('/<resource>', { data: body });
  }
}
```
