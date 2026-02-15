# `templates` store

- **Source**: `src/stores/templates.ts`

## Purpose

Manage templates (reusable bundles/recipes) and synchronize them with the backend.

## State

- `templates: Ref<TemplateDto[]>`
- `isLoading: Ref<boolean>`
- `error: Ref<string | null>`

## Actions

- `fetchTemplates(): Promise<void>`
  - loads via `ApiClient.templates.list()`.

- `getTemplateById(id: string): Promise<TemplateDto | null>`
  - reads from local cache first; if missing, fetches from backend and caches the result.

- `createTemplate(data: { title: string; tags?: string[]; note?: string }): Promise<TemplateDto>`
- `updateTemplate(id: string, data: { title?: string; tags?: string[]; note?: string }): Promise<TemplateDto>`
- `addProductsToTemplate(templateId: string, productIds: string[]): Promise<void>`
- `removeProductFromTemplate(templateId: string, itemId: string): Promise<void>`
- `updateTemplateItem(templateId: string, itemId: string, data: {...}): Promise<void>`
- `deleteTemplates(ids: string[]): Promise<void>`
  - deletes on server and removes from local cache.
- `reorderTemplates(orderedIds: string[]): Promise<{ ok: boolean }>`

## External dependencies

- API:
  - `ApiClient.templates` (`src/services/requests/templates/index.ts`)
- Types:
  - `TemplateDto`, DTOs from `@plans-tracker/types`

## Error/loading strategy

- Many actions set `isLoading` for the whole store, including mutations.

## Notes

- `getTemplateById` caches fetched templates.
- Item-level operations return the whole updated template from API; the store replaces the matching template in cache.
- `deleteTemplates` contains duplicated `finally` blocks in the current implementation; be careful when modifying this file.
