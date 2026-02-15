import { ref } from "vue"
import { defineStore } from "pinia"
import { ApiClient } from "@/services/client"
import type {
  CreateTemplateDto,
  TemplateDto,
  UpdateTemplateDto,
  UpdateTemplateItemDto,
  PRICE_TYPE
} from "@plans-tracker/types"

export const useTemplatesStore = defineStore("templates", () => {
  const templates = ref<TemplateDto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchTemplates = async () => {
    isLoading.value = true
    error.value = null
    try {
      templates.value = await ApiClient.templates.list()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load templates"
    } finally {
      isLoading.value = false
    }
  }

  const getTemplateById = async (id: string): Promise<TemplateDto | null> => {
    // Try to find in local cache first
    let template = templates.value.find((t) => t.id === id)

    if (!template) {
      // Fetch from server
      try {
        template = await ApiClient.templates.get(id)
        // Add to cache
        templates.value.push(template)
      } catch (e: unknown) {
        error.value = e instanceof Error ? e.message : "Failed to load template"
        return null
      }
    }

    return template
  }

  const createTemplate = async (data: { title: string; tags?: string[]; note?: string }) => {
    isLoading.value = true
    error.value = null
    try {
      const payload: CreateTemplateDto = {
        title: data.title,
        tags: data.tags,
        note: data.note
      }

      const newTemplate = await ApiClient.templates.create(payload)
      templates.value.push(newTemplate)
      return newTemplate
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to create template"
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const updateTemplate = async (
    id: string,
    data: {
      title?: string
      tags?: string[]
      note?: string
    }
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const payload: UpdateTemplateDto = {
        title: data.title,
        tags: data.tags,
        note: data.note
      }

      const updatedTemplate = await ApiClient.templates.update(id, payload)
      const index = templates.value.findIndex((t) => t.id === id)

      if (index !== -1) {
        templates.value[index] = updatedTemplate
      }

      return updatedTemplate
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to update template"
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const addProductsToTemplate = async (templateId: string, productIds: string[]) => {
    try {
      const updatedTemplate = await ApiClient.templates.addItems(templateId, productIds)

      const index = templates.value.findIndex((t) => t.id === templateId)
      if (index !== -1) {
        templates.value[index] = updatedTemplate
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to add products"
      throw e
    }
  }

  const removeProductFromTemplate = async (templateId: string, itemId: string) => {
    try {
      const updatedTemplate = await ApiClient.templates.removeItem(templateId, itemId)

      const index = templates.value.findIndex((t) => t.id === templateId)
      if (index !== -1) {
        templates.value[index] = updatedTemplate
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to remove product"
      throw e
    }
  }

  const updateTemplateItem = async (
    templateId: string,
    itemId: string,
    data: {
      quantity?: number
      priceType?: PRICE_TYPE
      priceCurrency?: string | null
      priceMin?: number | null
      priceMax?: number | null
      sortIndex?: number
    }
  ) => {
    try {
      const updatedTemplate = await ApiClient.templates.updateItem(
        templateId,
        itemId,
        data as UpdateTemplateItemDto
      )

      const index = templates.value.findIndex((t) => t.id === templateId)
      if (index !== -1) {
        templates.value[index] = updatedTemplate
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to update item"
      throw e
    }
  }

  const deleteTemplates = async (ids: string[]) => {
    isLoading.value = true
    error.value = null
    try {
      await ApiClient.templates.removeBatch(ids)
      templates.value = templates.value.filter((t) => !ids.includes(t.id))
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to delete templates"
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const reorderTemplates = async (orderedIds: string[]) => {
    const orderMap = new Map(orderedIds.map((id, index) => [id, index]))
    templates.value.sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? Infinity
      const indexB = orderMap.get(b.id) ?? Infinity
      return indexA - indexB
    })

    return await ApiClient.templates.reorder(orderedIds)
  }

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    updateTemplateItem,
    addProductsToTemplate,
    removeProductFromTemplate,
    deleteTemplates,
    reorderTemplates
  }
})
