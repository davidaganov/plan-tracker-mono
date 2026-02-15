import { request } from "@/services/request"
import { routes } from "@/services/requests/locations/routes"
import type {
  CreateLocationDto,
  LocationDto,
  UpdateLocationDto,
  ReorderItemsDto,
  BatchDeleteDto
} from "@plans-tracker/types"

export async function list(familyId?: string): Promise<LocationDto[]> {
  return request.get<LocationDto[]>(routes.list(familyId))
}

export async function create(params: CreateLocationDto): Promise<LocationDto> {
  return request.post<LocationDto>(routes.create(), params)
}

export async function update(id: string, params: UpdateLocationDto): Promise<LocationDto> {
  return request.patch<LocationDto>(routes.update(id), params)
}

export async function remove(id: string): Promise<{ ok: boolean }> {
  return request.delete<{ ok: boolean }>(routes.remove(id))
}

export async function removeBatch(ids: string[]): Promise<{ ok: boolean }> {
  return request.delete<{ ok: boolean }>(routes.removeBatch(), {
    body: { ids } satisfies BatchDeleteDto
  })
}

export async function reorder(orderedIds: string[]): Promise<{ ok: boolean }> {
  return request.put<{ ok: boolean }>(routes.reorder(), { orderedIds } satisfies ReorderItemsDto)
}
