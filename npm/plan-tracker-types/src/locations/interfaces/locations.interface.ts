/**
 * DTO for a location.
 */
export interface LocationDto {
  /** Location ID */
  id: string
  /** Location title */
  title: string
  /** Normalized key */
  normalizedKey: string
  /** Note */
  note?: string | null
  /** Owner user ID */
  ownerId: string
  /** Sort index */
  sortIndex: number
  /** Creation date */
  createdAt: Date
  /** Update date */
  updatedAt: Date
}

/**
 * Response for locations select.
 */
export interface LocationsSelectResponse {
  /** Personal locations */
  personal: LocationDto[]
  /** Family locations */
  family: LocationDto[]
}

/**
 * DTO for creating a location.
 */
export interface CreateLocationDto {
  /** Location title */
  title: string
  /** Note */
  note?: string | null
}

/**
 * DTO for updating a location.
 */
export interface UpdateLocationDto {
  /** Location title */
  title?: string
  /** Note */
  note?: string | null
}

/**
 * DTO for sharing a location.
 */
export interface ShareLocationDto {
  /** Family ID */
  familyId: string
}

/**
 * DTO for setting location sharing.
 */
export interface SetLocationSharingDto {
  /** Family ID */
  familyId: string
  /** Location IDs */
  locationIds: string[]
}
