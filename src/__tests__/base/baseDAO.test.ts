import { describe, it, expect, beforeEach } from "vitest";
import { TestConcreteDAO, TestEntity } from "./testDAOImpl"
import { BaseDAO, BaseDatabaseService, BaseDTO } from "../../base";

/* eslint-disable @typescript-eslint/no-explicit-any */

type DAO = BaseDAO<BaseDTO, BaseDatabaseService, TestEntity>


// Check for both entitiy with soft deleition and without soft deletion
export class TestDTO1 extends BaseDTO {
    constructor() {
        super({
            baseSchema: {} as any,
            commonFields: {
                idField: "id",
                createdAtField: "createdAt",
                updatedAtField: "updatedAt",
                isDeletedField: "isDeleted",
            }
        })
    }
}

export class TestDTO2 extends BaseDTO {
    constructor() {
        super({
            baseSchema: {} as any,
            commonFields: {
                idField: "id"
            },
        })
    }
}

describe("BaseDAO", () => {
    // With auto-generated fields
    let dao1: DAO;
    let testEntity1: TestEntity;

    // Without auto-generated fields
    let dao2: DAO;
    let testEntity2: TestEntity;

    beforeEach(() => {
        dao1 = new TestConcreteDAO({
            dto: new TestDTO1()
        }) as any
        dao2 = new TestConcreteDAO({
            dto: new TestDTO2()
        }) as any
        testEntity1 = {
            id: "1",
            email: "test@user.com",
            password: "password123",
            isDeleted: false,
        }
        testEntity2 = {
            id: "2",
            email: "valid@email.com",
            password: "somerandompass"
        }
    })

    describe("Basic CRUD operation", () => {
        it("should insert and find a record", async () => {
            await dao1.insert(testEntity1);
            const found1 = await dao1.findById("1");

            await dao2.insert(testEntity2);
            const found2 = await dao2.findById("2");

            expect(found1).toEqual(testEntity1);
            expect(found2).toEqual(testEntity2);
        })

        it("should update specific fields with partial updates", async () => {
            const update = { email: "new_test@user.com" };

            await dao1.insert(testEntity1);
            const res1 = await dao1.update("1", update);
            await dao2.insert(testEntity2);
            const res2 = await dao2.update("2", update);

            expect(res1).toEqual({
                ...testEntity1,
                ...update,
            })
            expect(res2).toEqual({
                ...testEntity2,
                ...update
            })
        })
    })
})
