# Templates requests

- **Source**: `src/services/requests/templates/index.ts`

## Purpose

Typed HTTP wrappers for template operations (reusable sets of products).

## API

Templates:

- `list(): Promise<TemplateDto[]>`
- `get(id: string): Promise<TemplateDto>`
- `create(payload: CreateTemplateDto): Promise<TemplateDto>`
- `update(id: string, payload: UpdateTemplateDto): Promise<TemplateDto>`
- `remove(id: string): Promise<{ ok: boolean }>`
- `reorder(orderedIds: string[]): Promise<{ ok: boolean }>`

Items:

- `addItems(templateId: string, productIds: string[]): Promise<TemplateDto>`
- `removeItem(templateId: string, itemId: string): Promise<TemplateDto>`
- `updateItem(templateId: string, itemId: string, payload: UpdateTemplateItemDto): Promise<TemplateDto>`

## Dependencies

- `src/services/request.ts`
- DTOs from `@plans-tracker/types`

## Notes

- Endpoints are under `/api/templates/**`.
- Item operations mutate and return the whole `TemplateDto`.
