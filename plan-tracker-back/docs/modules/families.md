# Families module

- **Source**:
  - Routes: `src/modules/families/routes.ts`
  - Service: `src/modules/families/service.ts`
  - Access checks:
    - `src/common/services/**` (e.g. `FamilyAccessService`)

## Purpose

Manage family groups and sharing relationships.

Backend primitives:

- family membership (`FamilyMember`) with roles
- sharing join tables:
  - `ListFamilyShare`
  - `LocationFamilyShare`
  - `ProductFamilyShare`
  - `TemplateFamilyShare`

## Routes (mounted under `/api/families`)

See `src/modules/families/routes.ts` for the complete endpoints.

## Related modules

- Lists, Locations, Products, Templates (sharing):
  - `docs/modules/lists.md`
  - `docs/modules/locations.md`
  - `docs/modules/products.md`
  - `docs/modules/templates.md`
