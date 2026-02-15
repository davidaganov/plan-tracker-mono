# Locations requests

- **Source**:
  - `src/services/requests/locations/index.ts`
  - `src/services/requests/locations/routes.ts`

## Purpose

Typed HTTP wrappers for locations (stores/shops) used in lists and catalog.

## API

- `list(familyId?: string): Promise<LocationDto[]>`
- `create(params: CreateLocationDto): Promise<LocationDto>`
- `update(id: string, params: UpdateLocationDto): Promise<LocationDto>`
- `remove(id: string): Promise<{ ok: boolean }>`
- `reorder(orderedIds: string[]): Promise<{ ok: boolean }>`

## Routing helper

`routes` provides string builders for endpoints.

Note: `routes.ts` currently returns paths like `api/locations` (without a leading `/`). This works as long as callers treat it as a relative URL.

## Dependencies

- `src/services/request.ts`
- DTOs from `@plans-tracker/types`

## Notes

- Consider keeping endpoint strings consistent across request modules (either always `"/api/..."` or always `"api/..."`).
