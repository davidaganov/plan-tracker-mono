import { describe, it, expect, beforeEach } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import { PrismaClient } from "@prisma/client"
import { ListsAccessService } from "@/modules/lists/services/lists-access.service"
import { ServiceError } from "@/common/errors"
import { ACCESS_LEVEL, FAMILY_ROLE } from "@plans-tracker/types"

describe("ListsAccessService", () => {
  const prismaMock = mockDeep<PrismaClient>()
  let service: ListsAccessService

  beforeEach(() => {
    mockReset(prismaMock)
    service = new ListsAccessService(prismaMock)
  })

  describe("assertAccess", () => {
    it("should allow owner irrespective of shares", async () => {
      const userId = "owner-1"
      const listId = "list-1"

      const listMock = {
        id: listId,
        ownerId: userId,
        familyShares: []
      }

      prismaMock.list.findUnique.mockResolvedValue(listMock as any)

      const result = await service.assertAccess(userId, listId, ACCESS_LEVEL.READ)
      expect(result).toEqual(listMock)
    })

    it("should deny if list has no shares and user is not owner", async () => {
      const userId = "user-2"
      const listId = "list-1"

      const listMock = {
        id: listId,
        ownerId: "owner-1",
        familyShares: []
      }

      prismaMock.list.findUnique.mockResolvedValue(listMock as any)

      await expect(service.assertAccess(userId, listId, ACCESS_LEVEL.READ)).rejects.toThrow(
        ServiceError.forbidden("Access denied: Private list")
      )
    })

    it("should allow member of shared family to read", async () => {
      const userId = "user-2"
      const listId = "list-1"
      const familyId = "fam-1"

      const listMock = {
        id: listId,
        ownerId: "owner-1",
        familyShares: [{ familyId, listId }]
      }

      prismaMock.list.findUnique.mockResolvedValue(listMock as any)

      // Mock optimized batch fetch
      prismaMock.familyMember.findMany.mockResolvedValue([
        { familyId, userId, role: FAMILY_ROLE.READER }
      ] as any)

      const result = await service.assertAccess(userId, listId, ACCESS_LEVEL.READ)
      expect(result).toEqual(listMock)
    })

    it("should deny reader from writing", async () => {
      const userId = "user-2"
      const listId = "list-1"
      const familyId = "fam-1"

      const listMock = {
        id: listId,
        ownerId: "owner-1",
        familyShares: [{ familyId, listId }]
      }

      prismaMock.list.findUnique.mockResolvedValue(listMock as any)

      prismaMock.familyMember.findMany.mockResolvedValue([
        { familyId, userId, role: FAMILY_ROLE.READER }
      ] as any)

      await expect(service.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)).rejects.toThrow(
        /admin role/
      )
    })

    it("should allow admin of shared family to write", async () => {
      const userId = "user-2"
      const listId = "list-1"
      const familyId = "fam-1"

      const listMock = {
        id: listId,
        ownerId: "owner-1",
        familyShares: [{ familyId, listId }]
      }

      prismaMock.list.findUnique.mockResolvedValue(listMock as any)

      prismaMock.familyMember.findMany.mockResolvedValue([
        { familyId, userId, role: FAMILY_ROLE.ADMIN }
      ] as any)

      const result = await service.assertAccess(userId, listId, ACCESS_LEVEL.WRITE)
      expect(result).toEqual(listMock)
    })

    it("should throw NotFound if list does not exist", async () => {
      prismaMock.list.findUnique.mockResolvedValue(null)
      await expect(service.assertAccess("u1", "bad-id", ACCESS_LEVEL.READ)).rejects.toThrow(
        "List not found"
      )
    })

    it("should deny if list is shared but user is not member", async () => {
      const userId = "u1"
      const listId = "l1"
      const familyId = "f1"

      prismaMock.list.findUnique.mockResolvedValue({
        id: listId,
        ownerId: "other",
        familyShares: [{ familyId, listId }]
      } as any)

      // No memberships returned
      prismaMock.familyMember.findMany.mockResolvedValue([])

      await expect(service.assertAccess(userId, listId, ACCESS_LEVEL.READ)).rejects.toThrow(
        "Access denied"
      )
    })

    it("should deny read access if user has no role in any shared family", async () => {
      const userId = "u1"
      const listId = "l1"
      const familyId = "f1"

      prismaMock.list.findUnique.mockResolvedValue({
        id: listId,
        ownerId: "other",
        familyShares: [{ familyId, listId }]
      } as any)

      // Return memberships for different families
      prismaMock.familyMember.findMany.mockResolvedValue([
        { familyId: "f2", userId, role: FAMILY_ROLE.ADMIN }
      ] as any)

      await expect(service.assertAccess(userId, listId, ACCESS_LEVEL.READ)).rejects.toThrow(
        "Access denied"
      )
    })
  })

  describe("getListOrThrow", () => {
    it("should return list when found", async () => {
      const listMock = {
        id: "list-1",
        ownerId: "user-1",
        familyShares: []
      }

      prismaMock.list.findUnique.mockResolvedValue(listMock as any)

      const result = await service.getListOrThrow("list-1")
      expect(result).toEqual(listMock)
    })

    it("should throw NotFound when list does not exist", async () => {
      prismaMock.list.findUnique.mockResolvedValue(null)
      await expect(service.getListOrThrow("bad-id")).rejects.toThrow(
        ServiceError.notFound("List not found")
      )
    })
  })

  describe("getUserFamilyRole", () => {
    it("should return null if user is not in family", async () => {
      const userId = "u1"
      const familyId = "f1"
      prismaMock.familyMember.findUnique.mockResolvedValue(null)
      const role = await service.getUserFamilyRole(userId, familyId)
      expect(role).toBeNull()
    })

    it("should return admin role if user is in family", async () => {
      const userId = "u1"
      const familyId = "f1"
      prismaMock.familyMember.findUnique.mockResolvedValue({ role: FAMILY_ROLE.ADMIN } as any)
      const role = await service.getUserFamilyRole(userId, familyId)
      expect(role).toBe(FAMILY_ROLE.ADMIN)
    })

    it("should return reader role", async () => {
      const userId = "u1"
      const familyId = "f1"
      prismaMock.familyMember.findUnique.mockResolvedValue({ role: FAMILY_ROLE.READER } as any)
      const role = await service.getUserFamilyRole(userId, familyId)
      expect(role).toBe(FAMILY_ROLE.READER)
    })
  })
})
