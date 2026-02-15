export const routes = {
  list: (familyId?: string) => `api/locations${familyId ? `?familyId=${familyId}` : ""}`,
  create: () => "api/locations",
  update: (id: string) => `api/locations/${id}`,
  remove: (id: string) => `api/locations/${id}`,
  removeBatch: () => "api/locations",
  reorder: () => "api/locations/reorder"
} as const
