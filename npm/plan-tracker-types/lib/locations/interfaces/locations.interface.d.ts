export interface LocationDto {
    id: string;
    title: string;
    normalizedKey: string;
    note?: string | null;
    ownerId: string;
    sortIndex: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface LocationsSelectResponse {
    personal: LocationDto[];
    family: LocationDto[];
}
export interface CreateLocationDto {
    title: string;
    note?: string | null;
}
export interface UpdateLocationDto {
    title?: string;
    note?: string | null;
}
export interface ShareLocationDto {
    familyId: string;
}
export interface SetLocationSharingDto {
    familyId: string;
    locationIds: string[];
}
