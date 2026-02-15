# Locations module

- **Source**:
  - Routes: `src/modules/locations/routes.ts`
  - Service: `src/modules/locations/service.ts`

## Purpose

Manage user-owned locations (shops/places) and share them with families.

## Routes (mounted under `/api/locations`)

- `GET /`
  - Query:
    - `familyId?: string`
  - Behavior:
    - without `familyId`: list personal locations
    - with `familyId`: list locations for family selection (personal + shared)

- `POST /`
  - Body: `CreateLocationDto`

- `PATCH /:locationId`
  - Body: `UpdateLocationDto`

- `DELETE /:locationId`

Sharing:

- `POST /:locationId/share`
  - Body: `ShareLocationDto` (`familyId`)

- `POST /:locationId/unshare`
  - Body: `ShareLocationDto` (`familyId`)

- `POST /sharing`
  - Body: `SetLocationSharingDto` (`familyId`, `locationIds[]`)

Ordering:

- `PUT /reorder`
  - Body: `ReorderItemsDto` (`orderedIds[]`)

## Auth / access control

- Uses `getAuthUser(req)`.
- Mutations require ownership.
- Sharing requires family admin.

## Deletion side effects

- Removes item-location references
- Removes product default location references
- Removes family shares

## Related modules

- Products (default locations): `docs/modules/products.md`
- Families (sharing): `docs/modules/families.md`
