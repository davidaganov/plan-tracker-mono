# Templates module

- **Source**:
  - Routes: `src/modules/templates/routes.ts`
  - Service: `src/modules/templates/service.ts`

## Purpose

Manage user-owned templates (bundles/recipes) consisting of template items that may reference products.

## Routes (mounted under `/api/templates`)

- `GET /`
  - Query:
    - `familyId?: string`
  - Behavior:
    - without `familyId`: list personal templates
    - with `familyId`: list templates for family selection (personal + shared)

- `GET /:templateId`

- `POST /`
  - Body: `CreateTemplateDto`

- `PATCH /:templateId`
  - Body: `UpdateTemplateDto`

- `DELETE /:templateId`

Items:

- `POST /:templateId/items`
  - Body: `AddTemplateItemsDto` (`productIds[]`)

- `PATCH /:templateId/items/:itemId`
  - Body: `UpdateTemplateItemDto`

- `DELETE /:templateId/items/:itemId`

Sharing:

- `POST /:templateId/share`
  - Body: `ShareTemplateDto` (`familyId`)

- `POST /:templateId/unshare`
  - Body: `ShareTemplateDto` (`familyId`)

- `POST /sharing`
  - Body: `SetTemplateSharingDto` (`familyId`, `templateIds[]`)

Ordering:

- `PUT /reorder`
  - Body: `ReorderItemsDto` (`orderedIds[]`)

## Auth / access control

- Uses `getAuthUser(req)`.
- Item mutation requires template ownership.
- `GET /:templateId` is accessible to:
  - owner
  - family member if template is shared to a family the user belongs to

## Service invariants

- Adding items requires referenced products to be owned by the current user.
- Sharing a template triggers auto-sharing of its owned product dependencies to the family.

## Related modules

- Products: `docs/modules/products.md`
- Families (sharing): `docs/modules/families.md`
- Shared types: `@plans-tracker/types`
