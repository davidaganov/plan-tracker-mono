export type PersonalFamilyView<T> = {
  personal: T[]
  family: T[]
}

export const mergePersonalAndFamily = <T extends { normalizedKey: string }>(args: {
  personal: T[]
  family: T[]
}): PersonalFamilyView<T> => {
  const personalKeys = new Set(args.personal.map((x) => x.normalizedKey))
  const family = args.family.filter((x) => !personalKeys.has(x.normalizedKey))
  return { personal: args.personal, family }
}
