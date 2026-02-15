import {
  PRICE_TYPE,
  CURRENCIES,
  type ProductDto,
  type ShoppingItemDto,
  type TemplateItemDto
} from "@plans-tracker/types"

export const getCurrencySymbol = (code?: string | null) => {
  if (!code) return ""
  return CURRENCIES.find((c: { code: string; symbol: string }) => c.code === code)?.symbol ?? code
}

export const formatPrice = (val: number, currency?: string | null) => {
  return `${val} ${getCurrencySymbol(currency)}`
}

export const getItemPriceString = (item: TemplateItemDto) => {
  if (item.priceType === PRICE_TYPE.NONE) return ""
  if (item.priceType === PRICE_TYPE.EXACT)
    return formatPrice(item.priceMin || 0, item.priceCurrency)
  return `${formatPrice(item.priceMin || 0, item.priceCurrency)} ~ ${formatPrice(item.priceMax || 0, item.priceCurrency)}`
}

export const getListItemPriceString = (product: ProductDto) => {
  if (product.defaultPriceType === PRICE_TYPE.NONE) return ""
  if (product.defaultPriceType === PRICE_TYPE.EXACT) {
    return formatPrice(product.defaultPriceMin || 0, product.defaultPriceCurrency)
  }

  return `${formatPrice(product.defaultPriceMin || 0, product.defaultPriceCurrency)} ~ ${formatPrice(product.defaultPriceMax || 0, product.defaultPriceCurrency)}`
}

export const calculateTemplateCost = (items: TemplateItemDto[]) => {
  if (!items?.length) return null

  let minTotal = 0
  let maxTotal = 0
  let hasPrice = false

  // Use first found currency as base
  const currency = items.find((i) => i.priceCurrency)?.priceCurrency

  for (const item of items) {
    if (item.priceType === PRICE_TYPE.NONE) continue
    hasPrice = true

    // Skip if currency mismatch (simple handle)
    if (item.priceCurrency !== currency) continue

    const qty = item.quantity || 1
    if (item.priceType === PRICE_TYPE.EXACT) {
      const price = item.priceMin || 0
      minTotal += price * qty
      maxTotal += price * qty
    } else if (item.priceType === PRICE_TYPE.RANGE) {
      minTotal += (item.priceMin || 0) * qty
      maxTotal += (item.priceMax || 0) * qty
    }
  }

  if (!hasPrice) return null

  if (minTotal === maxTotal) return formatPrice(minTotal, currency)
  return `${formatPrice(minTotal, currency)} ~ ${formatPrice(maxTotal, currency)}`
}

export const calculateListCost = (
  items: ShoppingItemDto[],
  products: ProductDto[]
): string | null => {
  if (!items?.length) return null

  let minTotal = 0
  let maxTotal = 0
  let hasPrice = false

  // Create a map for quick product lookup
  const productMap = new Map(products.map((p) => [p.id, p]))

  // Use first found currency as base
  const currency = products.find((p) => p.defaultPriceCurrency)?.defaultPriceCurrency

  for (const item of items) {
    if (!item.productId) continue

    const product = productMap.get(item.productId)
    if (!product || product.defaultPriceType === PRICE_TYPE.NONE) continue

    hasPrice = true

    // Skip if currency mismatch
    if (product.defaultPriceCurrency !== currency) continue

    const qty = item.quantity || 1
    if (product.defaultPriceType === PRICE_TYPE.EXACT) {
      const price = product.defaultPriceMin || 0
      minTotal += price * qty
      maxTotal += price * qty
    } else if (product.defaultPriceType === PRICE_TYPE.RANGE) {
      minTotal += (product.defaultPriceMin || 0) * qty
      maxTotal += (product.defaultPriceMax || 0) * qty
    }
  }

  if (!hasPrice) return null

  if (minTotal === maxTotal) return formatPrice(minTotal, currency)
  return `${formatPrice(minTotal, currency)} ~ ${formatPrice(maxTotal, currency)}`
}
