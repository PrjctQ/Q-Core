import { describe, it, expect, beforeEach } from "vitest";
import { TestConcreteDAO, TestDTOWithoutSoftDeletion, TestDTOWithSoftDeletion, TestEntity } from "./testDAOImpl"

type TestDTOType = TestDTOWithoutSoftDeletion | TestDTOWithSoftDeletion

const testConfiguration = [
    {
        name: "with soft delete support",
        dto: new TestDTOWithSoftDeletion(),
        expected: {
            supportsSoftDelete: true,
            canRestore: true
        }
    },
    {
        name: "without soft delete support",
        dto: new TestDTOWithoutSoftDeletion(),
        expected: {
            supportsSoftDelete: false,
            canRestore: false
        }
    },
]

describe("BaseDAO", () => {
    describe.each(testConfiguration)("$name", ({ dto, expected }) => {
        let dao: TestConcreteDAO<TestDTOType>
        let testEntity1: TestEntity
        let testEntity2: TestEntity


        beforeEach(() => {
            dao = new TestConcreteDAO({ dto })
            testEntity1 = {
                id: "test-id",
                email: "test@email.com",
                ...(expected.supportsSoftDelete && { isDeleted: false }),
            }
            testEntity2 = {
                id: "test2-id",
                email: "test2@email.com",
                ...(expected.supportsSoftDelete && { isDeleted: false }),
            }
        })

        describe("Basic CRUD operation", () => {
            it("should insert and find a record by id", async () => {
                await dao.insert(testEntity1)
                const found = await dao.findById(testEntity1.id)
                expect(found).toEqual(testEntity1)
            })

            it("should find all records", async () => {
                await dao.insert(testEntity1);
                await dao.insert(testEntity2);

                const result = await dao.findAll();
                expect(Array.isArray(result)).toBe(true);
                expect(result).toHaveLength(2);
                expect(result).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: testEntity1.id }),
                    expect.objectContaining({ id: testEntity2.id })
                ]))
            })

            it("should return empty array if no record found", async () => {
                const result = await dao.findAll();
                expect(result).toHaveLength(0)
            })

            it("should find a record with entity field", async () => {
                await dao.insert(testEntity1)
                const result = await dao.findOne({ email: "test@email.com" })
                expect(result).toEqual(testEntity1)
            })

            it("should update records with partial fields", async () => {
                const update = { email: "new@email.com" };
                await dao.insert(testEntity1)
                const result = await dao.update(testEntity1.id, update)
                expect(result).toEqual({
                    ...testEntity1,
                    ...update,
                })
            })

            if (expected.supportsSoftDelete) {
                it("should not contain soft-deleted record when all records are retrieved", async () => {
                    await dao.insert(testEntity1);
                    await dao.insert(testEntity2);
                    await dao.delete(testEntity1.id);

                    const result = await dao.findAll();

                    expect(result).not.toContain(testEntity1)
                })

                it("should soft delete and restore records", async () => {
                    await dao.insert(testEntity1)
                    await dao.softDelete(testEntity1.id)
                    const foundAfterDeletion = await dao.findById(testEntity1.id)
                    await dao.restore(testEntity1.id)
                    const foundAfterRestoration = await dao.findById(testEntity1.id)

                    expect(foundAfterDeletion).toBeNull()
                    expect(foundAfterRestoration).toEqual(testEntity1)
                })

                it("should NOT restore a non-existent record", async () => {
                    const result = await dao.restore("non-existent-record-id");
                    expect(result).toBeNull()
                })

                it("should NOT restore a hard-deleted record", async () => {
                    await dao.insert(testEntity1);
                    await dao.delete(testEntity1.id);
                    const result = await dao.restore(testEntity1.id);
                    expect(result).toBeNull()
                })
            }

            it("should perform hard deletion by default", async () => {
                await dao.insert(testEntity1);
                await dao.delete(testEntity1.id);
                const exists = await dao.findById(testEntity1.id)
                expect(exists).toBeNull()
            })

            it("should perform hard deletion if hardDelete is explicitly used", async () => {
                await dao.insert(testEntity1);
                await dao.delete(testEntity1.id);
                const exists = await dao.findById(testEntity1.id)
                expect(exists).toBeNull()
            })
        })

        it("should support transaction", async () => {
            await dao.withTransaction(async (tx) => {
                await tx.insert(testEntity1);
                const result = await tx.findById(testEntity1.id)
                expect(result).toEqual(testEntity1)
            })
        })
    })
})
