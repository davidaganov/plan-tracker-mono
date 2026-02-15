import { describe, it, expect, beforeEach, vi } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import { PrismaClient } from "@prisma/client"
import { ShoppingListTemplateService } from "@/modules/lists/services/shopping-list-templates.service"

// Create mock functions that we can control from tests
const mockAssertAccess = vi.fn()
const mockGetListOrThrow = vi.fn()

// Mock the module with a proper class constructor
vi.mock("@/modules/lists/services/lists-access.service", () => {
  class MockListsAccessService {
    assertAccess = mockAssertAccess
    getListOrThrow = mockGetListOrThrow
  }
  return {
    ListsAccessService: MockListsAccessService
  }
})

describe("ShoppingListTemplateService", () => {
  const prismaMock = mockDeep<PrismaClient>()
  let service: ShoppingListTemplateService

  beforeEach(() => {
    mockReset(prismaMock)
    // Reset mock functions
    mockAssertAccess.mockReset()
    mockGetListOrThrow.mockReset()
    service = new ShoppingListTemplateService(prismaMock)
  })

  describe("applyTemplates", () => {
    it("should add new items from template", async () => {
      const userId = "user-1"
      const listId = "list-1"
      const templateIds = ["tpl-1"]

      // Setup Access mock
      mockGetListOrThrow.mockResolvedValue({ id: listId, type: "shopping" })

      // Mock Templates
      prismaMock.template.findMany.mockResolvedValue([
        {
          id: "tpl-1",
          items: [
            { title: "Milk", quantity: 1, sortIndex: 0, productId: null },
            { title: "Eggs", quantity: 2, sortIndex: 1, productId: "prod-eggs" }
          ]
        }
      ] as any)

      // Mock Existing Items (Collision check)
      prismaMock.shoppingListItem.findMany.mockResolvedValue([])

      // Mock Aggregate (Sort Index)
      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: 0 } } as any)

      // Mock Create
      prismaMock.shoppingListItem.create.mockResolvedValue({
        id: "new-item-1",
        productId: null,
        normalizedKey: "milk"
      } as any)

      // Mock Transaction
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))

      const res = await service.applyTemplates(userId, listId, templateIds)

      expect(res.ok).toBe(true)
      expect(res.created).toBe(2)

      // Verify Milk created
      expect(prismaMock.shoppingListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: "Milk" })
        })
      )
    })

    it("should update quantity for colliding items", async () => {
      const userId = "user-1"
      const listId = "list-1"
      const templateIds = ["tpl-1"]

      // Setup Access
      mockGetListOrThrow.mockResolvedValue({ id: listId, type: "shopping" })

      // Mock Templates
      prismaMock.template.findMany.mockResolvedValue([
        {
          id: "tpl-1",
          items: [
            { title: "Milk", quantity: 1, sortIndex: 0, productId: null } // Collision by name
          ]
        }
      ] as any)

      // Mock Existing: Milk already exists
      prismaMock.shoppingListItem.findMany.mockResolvedValue([
        { id: "existing-milk", productId: null, normalizedKey: "milk" }
      ] as any)

      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: 0 } } as any)

      // Mock Transaction
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))

      const res = await service.applyTemplates(userId, listId, templateIds)

      expect(res.updated).toBe(1)
      expect(res.created).toBe(0)

      expect(prismaMock.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: "existing-milk" },
        data: { quantity: { increment: 1 } }
      })
    })

    it("should throw if no templates found", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "shopping" })

      prismaMock.template.findMany.mockResolvedValue([]) // No templates found

      await expect(service.applyTemplates("u1", "l1", ["missing"])).rejects.toThrow(
        "No templates found"
      )
    })

    it("should do nothing if templates have no items", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "shopping" })

      prismaMock.template.findMany.mockResolvedValue([{ id: "t1", items: [] }] as any)

      const res = await service.applyTemplates("u1", "l1", ["t1"])
      expect(res.ok).toBe(true)
      expect(res.created).toBe(0)
    })

    it("should throw if templateIds is empty", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "shopping" })

      await expect(service.applyTemplates("u1", "l1", [])).rejects.toThrow(
        "templateIds is required"
      )
    })

    it("should throw if list is not shopping type", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "task" })

      await expect(service.applyTemplates("u1", "l1", ["t1"])).rejects.toThrow(
        "Templates can be applied only to shopping lists"
      )
    })

    it("should correctly handle deduplication by productId", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "shopping" })

      prismaMock.template.findMany.mockResolvedValue([
        {
          id: "t1",
          items: [{ title: "Special Product", productId: "p1", quantity: 1, sortIndex: 0 }]
        }
      ] as any)

      // Mock existing item by productId but DIFFERENT title
      prismaMock.shoppingListItem.findMany.mockResolvedValue([
        { id: "ex1", productId: "p1", normalizedKey: "old-name" }
      ] as any)

      const txMock = {
        shoppingListItem: {
          update: vi.fn().mockResolvedValue({ id: "ex1", quantity: 2 }),
          aggregate: vi.fn().mockResolvedValue({ _max: { sortIndex: 0 } }),
          create: prismaMock.shoppingListItem.create
        }
      }
      prismaMock.$transaction.mockImplementation((cb: any) => cb(txMock))

      const res = await service.applyTemplates("u1", "l1", ["t1"])

      expect(res.updated).toBe(1)
      expect(txMock.shoppingListItem.update).toHaveBeenCalledWith({
        where: { id: "ex1" },
        data: { quantity: { increment: 1 } }
      })
    })

    it("should create new item with productId and update local maps", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "shopping" })

      prismaMock.template.findMany.mockResolvedValue([
        { id: "t1", items: [{ title: "New Product", productId: "p1", quantity: 1, sortIndex: 0 }] }
      ] as any)

      prismaMock.shoppingListItem.findMany.mockResolvedValue([])
      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: 0 } } as any)

      // Mock create return
      prismaMock.shoppingListItem.create.mockResolvedValue({
        id: "new1",
        productId: "p1",
        normalizedKey: "new product"
      } as any)

      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))

      const res = await service.applyTemplates("u1", "l1", ["t1"])
      expect(res.created).toBe(1)
      expect(prismaMock.shoppingListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ productId: "p1" })
        })
      )
    })

    it("should handle null max sortIndex by defaulting to 0", async () => {
      mockGetListOrThrow.mockResolvedValue({ id: "l1", type: "shopping" })

      prismaMock.template.findMany.mockResolvedValue([
        { id: "t1", items: [{ title: "First Item", quantity: 1, sortIndex: 0 }] }
      ] as any)

      prismaMock.shoppingListItem.findMany.mockResolvedValue([])
      // Return null for max sortIndex - this tests the ?? 0 branch
      prismaMock.shoppingListItem.aggregate.mockResolvedValue({ _max: { sortIndex: null } } as any)

      prismaMock.shoppingListItem.create.mockResolvedValue({
        id: "new1",
        productId: null,
        normalizedKey: "first item"
      } as any)

      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))

      const res = await service.applyTemplates("u1", "l1", ["t1"])
      expect(res.created).toBe(1)
      // Verify sortIndex starts at 1 (0 + 1) when max is null
      expect(prismaMock.shoppingListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ sortIndex: 1 })
        })
      )
    })
  })
})
