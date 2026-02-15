import { FAMILY_ROLE } from "../../families/enums";
export interface FamilyBaseDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface FamilyDto extends FamilyBaseDto {
    myRole: FAMILY_ROLE;
    isFavorite: boolean;
}
export interface FamilyMemberDto {
    id: string;
    userId: string;
    familyId: string;
    role: FAMILY_ROLE;
    joinedAt: Date;
    user?: {
        id: string;
        displayName: string;
    };
}
export interface FamilyInviteDto {
    id: string;
    familyId: string;
    invitedByUserId: string;
    token: string;
    expiresAt: Date;
    usedAt?: Date | null;
    createdAt: Date;
    invitedBy?: {
        id: string;
        displayName: string;
    };
}
export interface CreateFamilyDto {
    name: string;
}
export interface SetFavoriteFamilyDto {
    familyId?: string | null;
}
export interface UpdateFamilyDto {
    name?: string;
}
export interface UpdateMemberRoleDto {
    role: FAMILY_ROLE;
}
export interface AcceptInviteDto {
    token: string;
}
