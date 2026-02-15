import { LIST_TYPE, LIST_SORT_MODE, SEARCH_SCOPE } from "../../lists/enums";
export interface ListDto {
    id: string;
    type: LIST_TYPE;
    name: string;
    icon?: string | null;
    color?: string | null;
    sortMode: LIST_SORT_MODE;
    groupByLocations: boolean;
    ownerId: string;
    familyIds: string[];
    tags?: string[] | null;
    note?: string | null;
    sortIndex: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShoppingItemDto {
    id: string;
    title: string;
    productId: string;
    quantity: number;
    repeatEveryDays: number | null;
    isChecked: boolean;
    checkedAt: Date | null;
    sortIndex: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskItemDto {
    id: string;
    title: string;
    normalizedKey: string;
    durationMinutes: number | null;
    repeatEveryDays: number | null;
    isChecked: boolean;
    checkedAt: Date | null;
    sortIndex: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface SearchItemResult {
    id: string;
    listId: string;
    title: string;
    isChecked: boolean;
    sortIndex: number;
    listType: LIST_TYPE;
    listName: string;
    quantity?: number;
}
export interface CreateListDto {
    type: LIST_TYPE;
    name: string;
    icon?: string | null;
    color?: string | null;
    sortMode?: LIST_SORT_MODE;
    groupByLocations?: boolean;
    tags?: string[];
    note?: string | null;
}
export interface UpdateListDto {
    name?: string;
    icon?: string | null;
    color?: string | null;
    sortMode?: LIST_SORT_MODE;
    groupByLocations?: boolean;
    tags?: string[];
    note?: string | null;
}
export interface ShareListDto {
    familyId: string;
}
export interface ListIdParam {
    listId: string;
}
export interface CreateShoppingItemDto {
    title?: string | null;
    productId?: string | null;
    quantity?: number | null;
    repeatEveryDays?: number | null;
}
export interface UpdateShoppingItemDto {
    title?: string | null;
    productId?: string | null;
    quantity?: number | null;
    repeatEveryDays?: number | null;
    sortIndex?: number | null;
}
export interface ToggleItemDto {
    isChecked: boolean;
}
export interface ReorderItemsDto {
    orderedIds: string[];
}
export interface ApplyTemplatesDto {
    templateIds: string[];
}
export interface SendListDto {
    familyId: string;
    recipientUserIds?: string[];
    allExceptMe?: boolean;
}
export interface ShoppingItemIdParam {
    listId: string;
    itemId: string;
}
export interface CreateTaskItemDto {
    title: string;
    durationMinutes?: number | null;
    repeatEveryDays?: number | null;
}
export interface UpdateTaskItemDto {
    title?: string | null;
    durationMinutes?: number | null;
    repeatEveryDays?: number | null;
}
export interface TaskItemIdParam {
    listId: string;
    itemId: string;
}
export interface SearchItemsQuery {
    query: string;
    type?: LIST_TYPE;
    familyId?: string;
    scope?: SEARCH_SCOPE;
}
