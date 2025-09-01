import type { PrismaClient } from "@prisma/client";
import { BaseDTO, BaseDAO } from "../base";
import { PrismaService, ServiceLocator } from "../infra";

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class PrismaDAO<
    TDTO extends BaseDTO = any,
    TEntity = ReturnType<TDTO['toCreateDTO']>,
> extends BaseDAO<TDTO, TEntity> {
    private modelName: keyof PrismaClient;
    private _prismaService: unknown

    constructor(config: {
        modelName: keyof PrismaClient;
        dto: TDTO;
    }) {
        // NOTE: A service locator pattern has been used to avoid a dependency
        // injection for prisma service. This is done to reduce developer
        // learning curve

        // const prismaService = ServiceLocator.get<PrismaService>("prismaService")
        super({
            adapter: null,
            dto: config.dto
        });
        this.modelName = config.modelName;
    }

    protected get prismaService(): any {
        if (!this._prismaService) {
            this._prismaService = ServiceLocator.get<PrismaService>("prismaService")
        }
        return this._prismaService
    }

    protected get model() {
        return this.prismaService.client[this.modelName as keyof PrismaClient] as any;
    }

    protected async _create(data: TEntity): Promise<TEntity> {
        return this.model.create({ data })
    }
    protected async _findById(
        id: string,
        options: Record<string, unknown> = {}
    ): Promise<TEntity | null> {
        return this.model.findUnique({
            where: { id },
            ...options
        })
    }
    protected async _findUnique(
        filter: Partial<TEntity>,
        options: Record<string, unknown> = {}
    ): Promise<TEntity | null> {
        return this.model.findUnique({ where: filter, ...options });
    }
    protected async _findAll(
        filter?: Partial<TEntity> | undefined,
        options: Record<string, unknown> = {}
    ): Promise<TEntity[]> {
        return this.model.findMany({
            where: filter,
            ...options
        })
    }
    protected async _updateOne(
        id: string,
        data: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity> {
        return this.model.update({
            where: { id },
            data,
            ...options
        })
    }
    protected async _softDeleteOne(id: string): Promise<TEntity | null> {
        // Throw error if entity doesnt support soft deletion
        if (!this.supportsSoftDelete) {
            throw new Error("Soft deletion is not supported for this entity")
        }

        // Derive the field name from dto instead of hardcoding
        const isDeletedField = this.dto.config.autoFields.isDeletedField as string

        // Perform a soft deletion by updating the soft deletion field
        const entity = await this.model.update({
            where: { id },
            data: {
                [isDeletedField]: true
            }
        })

        return entity
    }
    protected async _hardDeleteOne(id: string): Promise<TEntity | null> {
        const entity = await this.model.delete({
            where: { id },
        })
        return entity;
    }
    protected async _restore(id: string): Promise<TEntity | null> {
        if (!this.supportsSoftDelete) {
            throw new Error("Restoration is not available for this entity")
        }

        const isDeletedField = this.dto.config.autoFields.isDeletedField as string

        const entity = await this.model.update({
            where: { id },
            data: {
                [isDeletedField]: false
            }
        })

        return entity
    }

    /**
     * Implementation of the abstract transaction method
     * Executes an operation within a database transaction context
     */
    protected async _withTransaction<T>(
        operation: (transactionalDAO: this) => Promise<T>
    ): Promise<T> {
        return await this.prismaService.client.$transaction(async (tx: this) => {
            // Create a transactional instance of this DAO
            const transactionalDAO = this.createTransactionalInstance(tx);
            
            // Execute the provided operation with the transactional DAO
            return await operation(transactionalDAO);
        });
    }

    /**
     * Creates a transactional instance that uses the provided transaction client
     */
    private createTransactionalInstance(tx: any): this {
        // Create a new instance with the same prototype
        const transactionalDAO = Object.create(Object.getPrototypeOf(this));
        
        // Copy all properties from the current instance
        Object.assign(transactionalDAO, this);
        
        // Override the prismaService to use transaction context
        // We need to create a proxy that intercepts model access
        const transactionalPrismaService = {
            ...this.prismaService,
            client: new Proxy(this.prismaService.client, {
                get: (target, prop) => {
                    if (prop === this.modelName) {
                        return tx[this.modelName];
                    }
                    return target[prop as keyof typeof target];
                }
            })
        };
        
        transactionalDAO._prismaService = transactionalPrismaService;
        
        return transactionalDAO;
    }
}
