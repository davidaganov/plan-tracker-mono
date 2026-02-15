# Lists module

- **Source**:
  - Routes index: `src/modules/lists/routes/index.ts`
  - Routes:
    - `src/modules/lists/routes/lists.routes.ts`
    - `src/modules/lists/routes/shopping-items.routes.ts`
    - `src/modules/lists/routes/task-items.routes.ts`
    - `src/modules/lists/routes/search.routes.ts`
  - Services: `src/modules/lists/services/**`

## Purpose

Manage lists of two types:

- shopping lists
- tasks lists

Also manages list items (shopping items, task items), sharing, reorder, and search.

## Routes (mounted under `/api/lists`)

The module registers multiple route files. See the individual route source files for the full list.

## Notes

- The DB schema contains `List`, `ShoppingListItem`, `TaskListItem`.
- This module is the backend source of truth for `/products/lists/:id` and `/tasks` UI flows.

## Related modules

- Families (list sharing): `docs/modules/families.md`
- Products/Templates (apply templates / product references):
  - `docs/modules/products.md`
  - `docs/modules/templates.md`
