# `locations` store

- **Source**: `src/stores/locations.ts`

## Purpose

Manage locations (shops/places) used by the shopping domain.

## State

- `locations: Ref<LocationDto[]>`
- `isLoading: Ref<boolean>`
- `error: Ref<string | null>`

## Actions

- `fetchLocations(): Promise<void>`
  - loads via `ApiClient.locations.list()`.
- `createLocation(title: string, note?: string): Promise<void>`
  - creates and pushes new location.
- `updateLocation(id: string, title: string, note?: string): Promise<void>`
  - updates and replaces item in local cache.
- `deleteLocations(ids: string[]): Promise<void>`
  - loops and deletes one-by-one, then removes from cache.
- `reorderLocations(orderedIds: string[]): Promise<{ ok: boolean }>`

## External dependencies

- API:
  - `ApiClient.locations` (`src/services/requests/locations/index.ts`)

## Error/loading strategy

- Uses `isLoading` only for `fetchLocations`.
- Mutation actions set `error` and rethrow.

## Notes

- Deleting is sequential (`for...of`). If needed, it can be parallelized, but consider server rate limits.
- The store currently does not implement a single `deleteLocation` method; it only supports bulk delete.
