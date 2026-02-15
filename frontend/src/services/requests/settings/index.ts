import { request } from "@/services/request"
import { routes } from "@/services/requests/settings/routes"
import type { SettingsDto, UpdateSettingsDto } from "@plans-tracker/types"

export async function getSettings(initData?: string): Promise<SettingsDto> {
  return request.get<SettingsDto>(routes.getSettings(), {
    initData
  })
}

export async function updateSettings(
  settings: UpdateSettingsDto,
  initData?: string
): Promise<SettingsDto> {
  return request.patch<SettingsDto>(routes.updateSettings(), settings, {
    initData
  })
}
