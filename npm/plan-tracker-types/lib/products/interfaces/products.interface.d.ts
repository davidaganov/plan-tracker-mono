import { PRICE_TYPE, QUANTITY_UNIT } from "../../products/enums";
export interface ProductDto {
    id: string;
    title: string;
    normalizedKey: string;
    note?: string | null;
    defaultPriceType: PRICE_TYPE;
    defaultPriceCurrency?: string | null;
    defaultPriceMin?: number | null;
    defaultPriceMax?: number | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    defaultLocationIds: string[];
    sortIndex: number;
    quantityUnit?: QUANTITY_UNIT | null;
}
export interface ProductsSelectResponse {
    personal: ProductDto[];
    family: ProductDto[];
}
export interface CreateProductDto {
    title: string;
    note?: string | null;
    defaultLocationIds?: string[];
    quantityUnit?: QUANTITY_UNIT | null;
    defaultPriceType?: PRICE_TYPE;
    defaultPriceCurrency?: string | null;
    defaultPriceMin?: number | null;
    defaultPriceMax?: number | null;
}
export interface UpdateProductDto {
    title?: string;
    note?: string | null;
    defaultLocationIds?: string[];
    quantityUnit?: QUANTITY_UNIT | null;
    defaultPriceType?: PRICE_TYPE;
    defaultPriceCurrency?: string | null;
    defaultPriceMin?: number | null;
    defaultPriceMax?: number | null;
}
export interface ShareProductDto {
    familyId: string;
}
export interface SetProductSharingDto {
    familyId: string;
    productIds: string[];
}
