import { PrismaClient } from "@prisma/client";
import { BaseDTO, BaseDAO } from "../base";
import { PrismaService } from "../infra";

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class PrismaDAO<
    TDTO extends BaseDTO,
    TEntity = ReturnType<TDTO['toCreateDTO']>,
    TKey = string | number,
> extends BaseDAO<TDTO, PrismaService, TEntity, TKey> {
    private modelName: keyof PrismaClient;

    constructor(config: {
        modelName: keyof PrismaClient;
        dto: TDTO;
    }) {
        super({
            adapter: PrismaService.getInstance(),
            dto: config.dto
        });
        this.modelName = config.modelName;
    }

    protected get model() {
        return this.adapter.client[this.modelName as keyof PrismaClient] as any;
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
        const entity = await this.model.update({
            where: { id },
            data: {
                isDeleted: true
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
