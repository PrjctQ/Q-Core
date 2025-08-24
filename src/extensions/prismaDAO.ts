import type { PrismaClient } from "@prisma/client";
import { BaseDTO, BaseDAO } from "@/base";
import { PrismaService, ServiceLocator } from "@/infra";

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class PrismaDAO<
    TDTO extends BaseDTO,
    TEntity = ReturnType<TDTO['toCreateDTO']>,
    TKey = string | number,
> extends BaseDAO<TDTO, PrismaService, TEntity, TKey> {
    private modelName: keyof PrismaClient;
    private _prismaService: any

    constructor(config: {
        modelName: keyof PrismaClient;
        dto: TDTO;
    }) {
        // NOTE: A service locator pattern has been used to avoid a dependency
        // injection for prisma service. This is done to reduce developer
        // learning curve

        // const prismaService = ServiceLocator.get<PrismaService>("prismaService")
        super({
            adapter: null as any,
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
        id: TKey,
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
        id: TKey,
        data: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity> {
        return this.model.update({
            where: { id },
            data,
            ...options
        })
    }
    protected async _softDeleteOne(id: TKey): Promise<TEntity | null> {
        // Throw error if entity doesnt support soft deletion
        if (!this.supportsSoftDelete) {
            throw new Error("Soft deletion is not supported for this entity")
        }

        // Derive the field name from dto instead of hardcoding
        const isDeletedField = this.dto.config.commonFields.isDeletedField as string

        // Perform a soft deletion by updating the soft deletion field
        const entity = await this.model.update({
            where: { id },
            data: {
                [isDeletedField]: true
            }
        })

        return entity
    }

    protected async _hardDeleteOne(id: TKey): Promise<TEntity | null> {
        const entity = await this.model.delete({
            where: { id },
        })
        return entity;
    }
}
