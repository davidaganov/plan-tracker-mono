import { ref } from "vue"
import { defineStore } from "pinia"
import { ApiClient } from "@/services/client"
import type { LocationDto } from "@plans-tracker/types"

export const useLocationsStore = defineStore("locations", () => {
  const locations = ref<LocationDto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchLocations = async () => {
    isLoading.value = true
    error.value = null
    try {
      locations.value = await ApiClient.locations.list()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load locations"
    } finally {
      isLoading.value = false
    }
  }

  const createLocation = async (title: string, note?: string) => {
    error.value = null
    try {
      const data = await ApiClient.locations.create({ title, note })
      locations.value.push(data)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to create location"
      throw e
    }
  }

  const deleteLocations = async (ids: string[]) => {
    error.value = null
    try {
      await ApiClient.locations.removeBatch(ids)
      locations.value = locations.value.filter((l) => !ids.includes(l.id))
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to delete locations"
      throw e
    }
  }

  const updateLocation = async (id: string, title: string, note?: string) => {
    error.value = null
    try {
      const data = await ApiClient.locations.update(id, { title, note })
      const index = locations.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        locations.value[index] = data
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to update location"
      throw e
    }
  }

  const reorderLocations = async (orderedIds: string[]) => {
    const orderMap = new Map(orderedIds.map((id, index) => [id, index]))
    locations.value.sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? Infinity
      const indexB = orderMap.get(b.id) ?? Infinity
      return indexA - indexB
    })
    return await ApiClient.locations.reorder(orderedIds)
  }

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    createLocation,
    deleteLocations,
    updateLocation,
    reorderLocations
  }
})
