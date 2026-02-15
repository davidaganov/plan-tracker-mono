# Products module

- **Source**:
  - Routes: `src/modules/products/routes.ts`
  - Service: `src/modules/products/service.ts`

## Purpose

Manage user-owned products and sharing them with families.

## Routes (mounted under `/api/products`)

- `GET /`
  - Query:
    - `familyId?: string` (optional)
  - Behavior:
    - without `familyId`: list personal products
    - with `familyId`: list products for family selection (personal + shared)

- `POST /`
  - Body: `CreateProductDto`

- `PATCH /:productId`
  - Body: `UpdateProductDto`

- `DELETE /:productId`

Sharing:

- `POST /:productId/share`
  - Body: `ShareProductDto` (`familyId`)

- `POST /:productId/unshare`
  - Body: `ShareProductDto` (`familyId`)

- `POST /sharing`
  - Body: `SetProductSharingDto` (`familyId`, `productIds[]`)

Ordering:

- `PUT /reorder`
  - Body: `ReorderItemsDto` (`orderedIds[]`)

## Auth / access control

- Uses `getAuthUser(req)`.
- Updates/deletes require ownership (`ownerId`).
- Sharing requires family admin (`FamilyAccessService`).

## Service invariants

`ProductsService` validates:

- Default price consistency (type/currency/min/max)
- Default locations must be owned by the current user

Deletion side effects:

- Removes shopping list items referencing product
- Nulls template items referencing product
- Removes default locations + family shares

## Related modules

- Locations (default locations): `docs/modules/locations.md`
- Families (sharing): `docs/modules/families.md`
- Shared types: `@plans-tracker/types`
