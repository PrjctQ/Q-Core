import { BaseDatabaseService } from "./baseDatabaseService";
import { BaseDTO } from "./baseDTO";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FindOptions {
    skip?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>,
    [key: string]: any;
}

export interface DeleteConfig {
    returnRecord?: boolean,
    hardDelete?: boolean
}

export abstract class BaseDAO<
    TDTO extends BaseDTO,
    TDBService extends BaseDatabaseService,
    TEntity = ReturnType<TDTO['toCreateDTO']>,
    TKey = string | number,
> {
    protected adapter: TDBService;
    public readonly dto: TDTO;

    constructor(config: {
        adapter: TDBService
        dto: TDTO
    }) {
        this.adapter = config.adapter;
        this.dto = config.dto;
    }

    public async findAll(
        filter: Partial<TEntity>,
        options: FindOptions = {},
        includeDeleted: boolean = false,
    ): Promise<TEntity[]> {
        // Filter soft deleted records
        const enhancedFilter = includeDeleted
            ? filter
            : { ...filter, isDeleted: false }

        const result = await this._findAll(enhancedFilter, options);
        return result;
    }
    public async findOne(
        filter: Partial<TEntity>,
        options: FindOptions = {},
        includeDeleted: boolean = false
    ): Promise<TEntity | null> {
        // Filter soft deleted records
        const enhancedFilter = includeDeleted
            ? filter
            : { ...filter, isDeleted: false }

        const result = await this._findUnique(enhancedFilter, options);
        return result;
    }
    public async findById(
        id: TKey,
        options: Record<string, unknown> = {},
        includeDeleted: boolean = false
    ): Promise<TEntity | null> {
        // Filter soft deleted records
        const filter = { id };
        const enhancedFilter = includeDeleted
            ? filter
            : { ...filter, isDeleted: false }

        const result = await this._findUnique(enhancedFilter as TEntity, options)
        return result;
    }
    public async insert(entity: TEntity): Promise<TEntity | null> {
        const result = await this._create(entity);
        return result;
    }
    public async update(
        id: TKey,
        entity: TEntity,
        options?: Record<string, unknown>
    ): Promise<TEntity | null> {
        const result = await this._updateOne(id, entity, options);
        return result;
    }
    public async delete(
        id: TKey,
        config: {
            returnRecord: boolean
        } = {
                returnRecord: true
            }
    ): Promise<TEntity | null> {
        const result = await this._softDeleteOne(id);
        if (config?.returnRecord === true) return result;
        return null;
    }

    protected async hardDelete(id: TKey, config?: { returnRecord: boolean }): Promise<TEntity | null> {
        const result = await this._hardDeleteOne(id);
        if (config?.returnRecord === true) return result;
        return null;
    }

    protected abstract _create(data: TEntity): Promise<TEntity>;
    protected abstract _findById(
        id: TKey,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;
    protected abstract _findUnique(
        filter: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;
    protected abstract _findAll(
        filter?: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity[]>;
    protected abstract _updateOne(
        id: TKey,
        data: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;
    protected abstract _hardDeleteOne(id: TKey): Promise<TEntity | null>
    protected abstract _softDeleteOne(id: TKey): Promise<TEntity | null>
}
