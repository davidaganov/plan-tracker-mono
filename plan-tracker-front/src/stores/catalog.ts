import { ref } from "vue"
import { defineStore } from "pinia"
import { ApiClient } from "@/services/client"
import type { CreateProductDto, ProductDto, UpdateProductDto } from "@plans-tracker/types"

export const useCatalogStore = defineStore("catalog", () => {
  const products = ref<ProductDto[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async () => {
    isLoading.value = true
    error.value = null
    try {
      products.value = await ApiClient.catalog.list()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load products"
    } finally {
      isLoading.value = false
    }
  }

  const createProduct = async (payload: CreateProductDto) => {
    error.value = null
    try {
      const newProduct = await ApiClient.catalog.create(payload)
      products.value.push(newProduct)
      return newProduct
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to create product"
      throw e
    }
  }

  const updateProduct = async (id: string, payload: UpdateProductDto) => {
    error.value = null
    try {
      const updatedProduct = await ApiClient.catalog.update(id, payload)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return updatedProduct
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to update product"
      throw e
    }
  }

  const deleteProducts = async (ids: string[]) => {
    error.value = null
    try {
      await ApiClient.catalog.removeBatch(ids)
      products.value = products.value.filter((p) => !ids.includes(p.id))
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to delete products"
      throw e
    }
  }

  const reorderProducts = async (orderedIds: string[]) => {
    const orderMap = new Map(orderedIds.map((id, index) => [id, index]))
    products.value.sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? Infinity
      const indexB = orderMap.get(b.id) ?? Infinity
      return indexA - indexB
    })

    return await ApiClient.catalog.reorder(orderedIds)
  }

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProducts,
    reorderProducts
  }
})
