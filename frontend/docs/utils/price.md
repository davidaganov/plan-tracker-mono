# Price utilities

- **Source**: `src/utils/price.ts`

## Purpose

Provide small helpers for:

- formatting price strings
- rendering template/list item price labels
- calculating estimated total cost for templates and lists

## API

- `getCurrencySymbol(code?: string | null): string`
- `formatPrice(val: number, currency?: string | null): string`
- `getItemPriceString(item: TemplateItemDto): string`
- `getListItemPriceString(product: ProductDto): string`
- `calculateTemplateCost(items: TemplateItemDto[]): string | null`
- `calculateListCost(items: ShoppingItemDto[], products: ProductDto[]): string | null`

## Dependencies

- Types/enums from `@plans-tracker/types`:
  - `PRICE_TYPE`, `CURRENCIES`

## Notes / gotchas

- Cost calculation assumes a single currency:
  - it picks the first found currency and ignores items/products with mismatching currencies.
- When no prices are present, returns `null` (caller decides whether to hide the UI block).
- For templates, quantity defaults to `1` when missing.
