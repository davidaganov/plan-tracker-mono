import { PRICE_TYPE } from "../../products/enums/price-type.enum.js";
export interface TemplateItemDto {
    id: string;
    sortIndex: number;
    productId?: string | null;
    title: string;
    quantity: number;
    priceType: PRICE_TYPE;
    priceCurrency?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
}
export interface TemplateDto {
    id: string;
    title: string;
    normalizedKey: string;
    note?: string | null;
    tags: string[];
    sortIndex: number;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    items: TemplateItemDto[];
}
export interface TemplatesSelectResponse {
    personal: TemplateDto[];
    family: TemplateDto[];
}
export interface CreateTemplateDto {
    title: string;
    note?: string | null;
    tags?: string[];
}
export interface UpdateTemplateDto {
    title?: string;
    note?: string | null;
    tags?: string[];
}
export interface AddTemplateItemsDto {
    productIds: string[];
}
export interface UpdateTemplateItemDto {
    quantity?: number;
    priceType?: PRICE_TYPE;
    priceCurrency?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
    sortIndex?: number;
}
export interface ShareTemplateDto {
    familyId: string;
}
export interface SetTemplateSharingDto {
    familyId: string;
    templateIds: string[];
}
