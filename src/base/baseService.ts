import { errorCode } from "../lib";
import { ApiError } from "../utils";
import { BaseDAO } from "./baseDAO";

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class BaseService<
    TDAO extends BaseDAO<any, any>,
> {
    public dao: TDAO;
    protected dto: TDAO["dto"];

    constructor(config: { dao: TDAO }) {
        this.dao = config.dao;
        this.dto= config.dao.dto
    }

    async create(data: unknown) {
        const entity = await this._create(data);
        return this.dto.toJSON(entity);
    }
    async findById(id: string | number) {
        const entity = await this._findById(id);
        if (!entity || entity.isDeleted) {
            throw new ApiError({
                statusCode: 404,
                message: `Entity not found for ID: ${id}`,
                path: "id",
                errorCode: errorCode.notFound,
            });
        }
        return this.dto.toJSON(entity);
    }
    async findAll(filter = {}, options?: any) {
        const entities = await this._findAll(filter, options);
        return entities.map(e => this.dto.toJSON(e));
    }
    async update(id: string | number, data: unknown) {
        const entity = await this._update(id, data);
        return this.dto.toJSON(entity);
    }
    async delete(id: string | number) {
        return await this._delete(id);
    }
    
    protected async _create(data: unknown) {
        const dto = await this.dto.toCreateDTO(data);
        return await this.dao.insert(dto);
    }
    protected async _findById(id: string | number) {
        const entity = await this.dao.findById(id);
        return entity;
    }
    protected async _findAll(filter = {}, options?: any) {
        const entity = await this.dao.findAll(filter, options);
        return entity
    }
    protected async _update(id: string | number, data: unknown) {
        const dto = await this.dto.toUpdateDTO(data);
        return await this.dao.update(id, dto);
    }
    protected async _delete(id: string | number) {
        const entity = await this.dao.delete(id);
        return entity;
    }
}
