# Prompt: new API service from OpenAPI

**Read first:** `AGENTS.md`, `src/api/services/BookingService.ts`, `src/api/schemas/booking.ts`, `.ai/templates/service.ts.md`.

## Input

> Here is the OpenAPI fragment for `/auth` and `/booking` (paste spec or point the OpenAPI MCP at it). Generate the service and schemas for the `room` domain.

## Steps

1. For every response body write a zod schema in `src/api/schemas/<domain>.ts` and export `z.infer` types.
2. Create `src/api/services/<Domain>Service.ts`: one method per operation, returns `this.client.<verb><T>(...)`. **No assertions.**
3. Add a fixture in `src/fixtures/api.fixtures.ts` (`roomService`) and a factory in `src/data/factories/` if the entity is created in tests.
4. Add specs in `tests/api/` (CRUD, negative, schema) tagged `TAGS.api`; created entities register cleanup.

## Expected output (pattern from `BookingService`)

```ts
import type { ApiClient } from '@api/client/ApiClient';
import type { Room } from '@api/schemas/room';

/** Thin wrapper over /room. Returns responses; never asserts. */
export class RoomService {
  constructor(private readonly client: ApiClient) {}

  get(id: number) {
    return this.client.get<Room>(`/room/${id}`);
  }
  create(room: Room) {
    return this.client.post<Room>('/room', { data: room });
  }
}
```

Spec side (assertions live here):

```ts
const res = await roomService.get(id);
expect(res.status).toBe(200);
expectSchema(RoomSchema, res.data);
```
