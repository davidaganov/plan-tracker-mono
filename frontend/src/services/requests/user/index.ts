import { request } from "@/services/request"
import { routes } from "@/services/requests/user/routes"
import type { AuthUserDto } from "@plans-tracker/types"

export async function getUser(initData?: string): Promise<AuthUserDto> {
  return request.get<AuthUserDto>(routes.user(), {
    initData
  })
}
