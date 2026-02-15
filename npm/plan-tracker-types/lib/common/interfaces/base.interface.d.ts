export interface BaseEntityDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface BaseItemDto extends BaseEntityDto {
    title: string;
    isChecked: boolean;
    checkedAt: Date | null;
    sortIndex: number;
}
export interface BaseItemModel extends BaseItemDto {
    listId: string;
    normalizedKey: string;
}
export interface EntityUpdateDto {
    name?: string;
    title?: string;
    tags?: string[];
    note?: string | null;
}
export interface BatchDeleteDto {
    ids: string[];
}
