import { FAMILY_ROLE } from "@/families/enums"

/**
 * Base DTO for a family.
 */
export interface FamilyBaseDto {
  /** Family ID */
  id: string
  /** Family name */
  name: string
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * DTO for a family.
 */
export interface FamilyDto extends FamilyBaseDto {
  /** User's role in the family */
  myRole: FAMILY_ROLE
  /** Whether this family is the user's favorite */
  isFavorite: boolean
}

/**
 * DTO for a family member.
 */
export interface FamilyMemberDto {
  /** Member ID */
  id: string
  /** User ID */
  userId: string
  /** Family ID */
  familyId: string
  /** Member role */
  role: FAMILY_ROLE
  /** Join date */
  joinedAt: Date
  /** User information */
  user?: {
    /** User ID */
    id: string
    /** User display name */
    displayName: string
  }
}

/**
 * DTO for a family invite.
 */
export interface FamilyInviteDto {
  /** Invite ID */
  id: string
  /** Family ID */
  familyId: string
  /** Inviter user ID */
  invitedByUserId: string
  /** Invite token */
  token: string
  /** Expiration date */
  expiresAt: Date
  /** Used date */
  usedAt?: Date | null
  /** Creation date */
  createdAt: Date
  /** Inviter information */
  invitedBy?: {
    /** Inviter user ID */
    id: string
    /** Inviter display name */
    displayName: string
  }
}

/**
 * DTO for creating a family.
 */
export interface CreateFamilyDto {
  /** Family name */
  name: string
}

/**
 * DTO for setting a favorite family.
 */
export interface SetFavoriteFamilyDto {
  /** Favorite family ID */
  familyId?: string | null
}

/**
 * DTO for updating a family.
 */
export interface UpdateFamilyDto {
  /** Family name */
  name?: string
}

/**
 * DTO for updating a member role.
 */
export interface UpdateMemberRoleDto {
  /** Member role */
  role: FAMILY_ROLE
}

/**
 * DTO for accepting an invite.
 */
export interface AcceptInviteDto {
  /** Invite token */
  token: string
}
