import { BaseDTO, BaseDAO, BaseDatabaseService } from "@/base";
import z from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */


export interface TestEntity {
    id: string;
    email: string;
    isDeleted?: boolean;
}



export class MockDBService extends BaseDatabaseService {
    isConnected(): boolean { return true }
    protected async _connect(): Promise<void> { }
    protected async _disconnect(): Promise<void> { }
}

export class TestDTOWithSoftDeletion extends BaseDTO {
    constructor() {
        super({
            baseSchema: z.object({
                id: z.string(),
                email: z.email(),
                isDeleted: z.boolean()
            }),
            autoFields: {
                idField: "id",
                isDeletedField: "isDeleted"
            }
        })
    }
}

export class TestDTOWithoutSoftDeletion extends BaseDTO {
    constructor() {
        super({
            baseSchema: z.object({
                id: z.string(),
                email: z.email(),
            }),
            autoFields: {
                idField: "id"
            }
        })
    }
}

export class TestConcreteDAO<
    TDTO extends BaseDTO
> extends BaseDAO<TDTO, TestEntity> {
    private memory: Map<string, TestEntity> = new Map();
    private transactionActive: boolean = false;
    private transactionMemory: Map<string, TestEntity> | null = null;

    constructor({ dto }: { dto: TDTO }) {
        super({
            adapter: new MockDBService(),
            dto
        })
    }

    private get store() {
        return this.transactionActive ? this.transactionMemory! : this.memory;
    }

    protected async _create(data: TestEntity): Promise<TestEntity> {
        this.store.set(data.id, data)
        return data;
    }

    protected async _findById(id: string): Promise<TestEntity | null> {
        return this.store.get(id) || null;
    }

    protected async _findUnique(filter: Partial<TestEntity>): Promise<TestEntity | null> {
        // Creating an iterator for entities in store
        const entities = Array.from(this.store.values())

        // Find first entity that matches all filter criteria
        return entities.find(entity =>

            // Convert filter object to key, value pair and check each condition
            Object.entries(filter).every(([key, value]) =>

                // Compare filter field with corresponding entity field
                entity[key as keyof TestEntity] === value
            )
        ) || null
    }

    protected async _findAll(filter?: Partial<TestEntity> | undefined): Promise<TestEntity[]> {
        const entities = Array.from(this.store.values())

        if (filter) {
            return entities.filter(entity =>
                Object.entries(filter).every(([key, value]) =>
                    entity[key as keyof TestEntity] === value
                )
            )
        }

        return entities
    }

    protected async _updateOne(id: string, data: Partial<TestEntity>): Promise<TestEntity | null> {
        const existing = this.store.get(id)

        if (!existing) return null;

        const updatedEntity = { ...existing, ...data };
        this.store.set(id, updatedEntity)
        return updatedEntity
    }

    protected async _hardDeleteOne(id: string): Promise<TestEntity | null> {
        const deleted = this.store.get(id);
        this.store.delete(id);
        return deleted || null;
    }

    protected async _softDeleteOne(id: string): Promise<TestEntity | null> {
        return this._updateOne(id, { isDeleted: true })
    }

    protected async _restore(id: string): Promise<TestEntity | null> {
        return this._updateOne(id, { isDeleted: false })
    }

    protected async _withTransaction<T>(operation: (transactionalDAO: this) => Promise<T>): Promise<T> {
        this.transactionActive = true;
        this.transactionMemory = new Map(this.memory);

        try {
            const result = await operation(this)
            this.memory = this.transactionMemory;
            return result;
        } catch (error) {
            throw new Error(error as any);
        } finally {
            this.transactionActive = false;
            this.transactionMemory = null;
        }
    }
}
