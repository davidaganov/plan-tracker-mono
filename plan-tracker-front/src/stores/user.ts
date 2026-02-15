import { computed, ref } from "vue"
import { defineStore } from "pinia"
import { ApiClient } from "@/services/client"
import type { AuthUserDto } from "@plans-tracker/types"

export const useUserStore = defineStore("user", () => {
  const user = ref<AuthUserDto | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))

  const setUser = (next: AuthUserDto | null) => {
    user.value = next
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const fetchUser = async (initData?: string): Promise<AuthUserDto | null> => {
    isLoading.value = true
    setError(null)

    try {
      const user = await ApiClient.user.getUser(initData)
      setUser(user)
      return user
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load user")
      setUser(null)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateUserSettingsLocal = (settings: AuthUserDto["settings"]) => {
    if (!user.value) return
    user.value = {
      ...user.value,
      settings
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    fetchUser,
    setUser,
    updateUserSettingsLocal
  }
})
