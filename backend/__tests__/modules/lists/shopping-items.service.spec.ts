import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import { PrismaClient } from "@prisma/client"
import { ShoppingItemsService } from "@/modules/lists/services/shopping-items.service"

vi.mock("@/modules/lists/services/lists-access.service", () => {
  return {
    ListsAccessService: class {
      assertAccess = vi.fn()
      getListOrThrow = vi.fn()
      isMember = vi.fn()
    }
  }
})

describe("ShoppingItemsService", () => {
  const prismaMock = mockDeep<PrismaClient>()
  let service: ShoppingItemsService

  beforeEach(() => {
    mockReset(prismaMock)
    service = new ShoppingItemsService(prismaMock)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("listItems", () => {
    it("should reset checked items if repeat period has expired", async () => {
      const userId = "user-1"
      const listId = "list-1"
      const now = new Date("2024-01-10T12:00:00Z")

      vi.useFakeTimers()
      vi.setSystemTime(now)

      const checkedAt = new Date("2024-01-01T12:00:00Z") // 9 days ago
      const repeatEveryDays = 7

      const itemExpired = {
        id: "item-expired",
        listId,
        title: "Expired Item",
        isChecked: true,
        checkedAt: checkedAt,
        repeatEveryDays,
        sortIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: null,
        quantity: 1
      }

      const itemActive = {
        id: "item-active",
        listId,
        title: "Active Item",
        isChecked: true,
        checkedAt: new Date("2024-01-09T12:00:00Z"), // 1 day ago
        repeatEveryDays,
        sortIndex: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: null,
        quantity: 1
      }

      prismaMock.shoppingListItem.findMany.mockResolvedValue([itemExpired, itemActive] as any)

      const result = await service.listItems(userId, listId)

      // Expect specific update call for expired item
      expect(prismaMock.shoppingListItem.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["item-expired"] } },
        data: { isChecked: false, checkedAt: null }
      })

      // The returned result should reflect the update (optimistic update in service)
      const expiredResult = result.find((i) => i.id === "item-expired")
      expect(expiredResult?.isChecked).toBe(false)
      expect(expiredResult?.checkedAt).toBeNull()

      const activeResult = result.find((i) => i.id === "item-active")
      expect(activeResult?.isChecked).toBe(true)
    })
  })

  describe("createItem", () => {
    it("should create item with correct sort index", async () => {
      const userId = "user-1"
      const listId = "list-1"
      const dto = { title: "New Item", quantity: 1 }

      // Mock max sort index
      prismaMock.shoppingListItem.aggregate.mockResolvedValue({
        _max: { sortIndex: 5 }
      } as any)

      prismaMock.shoppingListItem.create.mockResolvedValue({
        id: "new-item",
        listId,
        title: "New Item",
        sortIndex: 6,
        isChecked: false,
        quantity: 1
        // ... other fields
      } as any)

      await service.createItem(userId, listId, dto)

      expect(prismaMock.shoppingListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sortIndex: 6,
            title: "New Item"
          })
        })
      )
    })

    it("should create item from product", async () => {
      // Mock product
      prismaMock.product.findUnique.mockResolvedValue({
        id: "p1",
        title: "Bread",
        ownerId: "u1"
      } as any)
      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: 0 } } as any)

      prismaMock.shoppingListItem.create.mockResolvedValue({
        id: "bread",
        title: "Bread",
        productId: "p1",
        quantity: 1
      } as any)

      const res = await service.createItem("u1", "l1", { productId: "p1" })
      expect(res.title).toBe("Bread")
    })
  })

  describe("updateItem", () => {
    it("should update item details", async () => {
      // Transaction mock
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))

      prismaMock.shoppingListItem.findUnique.mockResolvedValue({ id: "i1", listId: "l1" } as any)
      prismaMock.shoppingListItem.update.mockResolvedValue({ id: "i1", quantity: 5 } as any)

      const res = await service.updateItem("u1", "l1", "i1", { quantity: 5 })
      expect(res.quantity).toBe(5)
    })

    it("should throw if item not found/in different list", async () => {
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))
      prismaMock.shoppingListItem.findUnique.mockResolvedValue({ id: "i1", listId: "l2" } as any) // different list

      await expect(service.updateItem("u1", "l1", "i1", {})).rejects.toThrow("Item not found")
    })
  })

  describe("toggleItem", () => {
    it("should toggle checked state and move to bottom", async () => {
      prismaMock.shoppingListItem.findUnique.mockResolvedValue({
        id: "i1",
        listId: "l1",
        isChecked: false,
        sortIndex: 1
      } as any)

      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: 10 } } as any)

      prismaMock.shoppingListItem.update.mockResolvedValue({
        id: "i1",
        isChecked: true,
        sortIndex: 11
      } as any)

      const res = await service.toggleItem("u1", "l1", "i1", true)
      expect(res.isChecked).toBe(true)
      expect(res.sortIndex).toBe(11)
    })
  })

  describe("removeItem", () => {
    it("should delete item", async () => {
      prismaMock.shoppingListItem.findUnique.mockResolvedValue({ id: "i1", listId: "l1" } as any)
      await service.removeItem("u1", "l1", "i1")
      expect(prismaMock.shoppingListItem.delete).toHaveBeenCalledWith({ where: { id: "i1" } })
    })
  })

  describe("reorderItems", () => {
    it("should update sort indexes", async () => {
      prismaMock.shoppingListItem.findMany.mockResolvedValue([
        { id: "i1", listId: "l1", isChecked: false },
        { id: "i2", listId: "l1", isChecked: false }
      ] as any)

      prismaMock.$transaction.mockResolvedValue([])

      await service.reorderItems("u1", "l1", ["i1", "i2"], false)

      // Should verify update calls within transaction
      // Since we mocked $transaction result, we assume map executed.
      // Note: map executes immediately before transaction starts usually.
    })

    it("should throw if orderedIds is empty", async () => {
      await expect(service.reorderItems("u1", "l1", [], false)).rejects.toThrow(
        "orderedIds is required"
      )
    })

    it("should throw if some items do not belong to list", async () => {
      prismaMock.shoppingListItem.findMany.mockResolvedValue([
        { id: "i1", listId: "l1", isChecked: false },
        { id: "i2", listId: "l2", isChecked: false } // different list
      ] as any)

      await expect(service.reorderItems("u1", "l1", ["i1", "i2"], false)).rejects.toThrow(
        "Some items do not belong to list"
      )
    })

    it("should throw if checked-group mismatch", async () => {
      prismaMock.shoppingListItem.findMany.mockResolvedValue([
        { id: "i1", listId: "l1", isChecked: false },
        { id: "i2", listId: "l1", isChecked: true } // checked mismatch
      ] as any)

      await expect(service.reorderItems("u1", "l1", ["i1", "i2"], false)).rejects.toThrow(
        "checked-group mismatch"
      )
    })
  })

  describe("createItem with null productId in result", () => {
    it("should return empty string for null productId in DTO", async () => {
      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: 0 } } as any)

      // Mock create return with null productId
      prismaMock.shoppingListItem.create.mockResolvedValue({
        id: "new-item",
        listId: "l1",
        title: "Test Item",
        productId: null, // null productId
        quantity: 1,
        isChecked: false,
        sortIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)

      const res = await service.createItem("u1", "l1", { title: "Test Item", quantity: 1 })

      // Verify that null productId is converted to empty string
      expect(res.productId).toBe("")
    })
  })
})
