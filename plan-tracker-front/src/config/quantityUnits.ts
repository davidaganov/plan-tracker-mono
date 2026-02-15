import { QUANTITY_UNIT } from "@plans-tracker/types"

export type QuantityUnitOption = {
  value: QUANTITY_UNIT
  title: string
}

export const QUANTITY_UNIT_OPTIONS: QuantityUnitOption[] = [
  { value: QUANTITY_UNIT.PCS, title: "common.units.pcs" },
  { value: QUANTITY_UNIT.KG, title: "common.units.kg" },
  { value: QUANTITY_UNIT.G, title: "common.units.g" },
  { value: QUANTITY_UNIT.L, title: "common.units.l" },
  { value: QUANTITY_UNIT.ML, title: "common.units.ml" }
]
