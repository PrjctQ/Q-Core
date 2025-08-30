import { errorCode } from "../lib";
import { ApiError } from "../utils";
import { BaseDAO } from "./baseDAO";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Abstract base class for service layer implementations
 * Provides standardized CRUD operations and business logic encapsulation
 * Acts as a bridge between controllers and data access layer
 * 
 * @template TDAO - Type of the Data Access Object this service uses
 * 
 * @example
 * // Concrete service implementation
 * class UserService extends BaseService<UserDAO> {
 *   constructor() {
 *     super({ dao: userDAO });
 *   }
 * 
 *   // Override formatOutput to add custom fields to all responses
 *   protected _formatOutput(entity: any) {
 *     const json = super._formatOutput(entity);
 *     return {
 *       ...json,
 *       profileLink: `/users/${json.id}`
 *     };
 *   }
 * 
 *   // Override core logic to add custom validation
 *   protected async _create(data: unknown) {
 *     // Custom pre-create logic
 *     if (data.email.includes('spam')) {
 *       throw new ApiError({...});
 *     }
 *     return super._create(data);
 *   }
 * }
 */
export abstract class BaseService<
    TDAO extends BaseDAO<any, any>,
> {
    /** Data Access Object instance for database operations */
    public dao: TDAO;

    /** Data Transfer Object instance for validation and transformation */
    protected dto: TDAO["dto"];

    /**
     * Creates a new BaseService instance
     * @param config - Service configuration
     * @param config.dao - Data Access Object instance
     */
    constructor(config: { dao: TDAO }) {
        this.dao = config.dao;
        this.dto = config.dao.dto;
    }

    /**
     * Creates a new entity
     * @param data - Entity data to create
     * @returns Created entity in JSON format
     */
    async create(data: unknown) {
        const entity = await this._create(data);
        return this._formatOutput(entity);
    }

    /**
     * Finds an entity by ID
     * @param id - Entity identifier
     * @returns Entity in JSON format
     * @throws {ApiError} 404 - If entity not found or is deleted
     */
    async findById(id: string) {
        const entity = await this._findById(id);
        if (!entity || entity.isDeleted) {
            throw new ApiError({
                statusCode: 404,
                message: `Entity not found for ID: ${id}`,
                path: "id",
                errorCode: errorCode.notFound,
            });
        }
        return this._formatOutput(entity);
    }

    /**
     * Finds all entities matching optional filter criteria
     * @param filter - Filter criteria for querying
     * @param options - Additional query options
     * @returns Array of entities in JSON format
     */
    async findAll(filter = {}, options?: any) {
        const entities = await this._findAll(filter, options);
        return entities.map(e => this._formatOutput(e));
    }

    /**
     * Updates an existing entity
     * @param id - Entity identifier to update
     * @param data - Partial data to update
     * @returns Updated entity in JSON format
     */
    async update(id: string, data: unknown) {
        const entity = await this._update(id, data);
        return this._formatOutput(entity);
    }

    /**
     * Deletes an entity (soft or hard delete based on DAO implementation)
     * @param id - Entity identifier to delete
     * @returns Result of delete operation in JSON format
     */
    async delete(id: string) {
        const entity = await this._delete(id);
        return this._formatOutput(entity);
    }

    /**
     * Formats entity output using DTO's toJSON method
     * Override this method to customize the output format for all operations
     * @param entity - Raw entity from database
     * @returns Formatted entity output
     */
    protected _formatOutput(entity: any): any {
        return this.dto.toJSON(entity);
    }

    /**
     * Protected implementation of create operation
     * Validates data using DTO before passing to DAO
     * Override this method to add custom business logic to create operations
     * @param data - Raw entity data
     * @returns Created entity
     */
    protected async _create(data: unknown) {
        const dto = await this.dto.toCreateDTO(data);
        return await this.dao.insert(dto);
    }

    /**
     * Protected implementation of find by ID operation
     * Override this method to add custom business logic to find operations
     * @param id - Entity identifier
     * @returns Entity or null if not found
     */
    protected async _findById(id: string) {
        const entity = await this.dao.findById(id);
        return entity;
    }

    /**
     * Protected implementation of find all operation
     * Override this method to add custom business logic to find all operations
     * @param filter - Query filter criteria
     * @param options - Additional query options
     * @returns Array of entities
     */
    protected async _findAll(filter: Record<string, unknown>, options?: any) {
        const entity = await this.dao.findAll(filter, options);
        return entity;
    }

    /**
     * Protected implementation of update operation
     * Validates data using DTO before passing to DAO
     * Override this method to add custom business logic to update operations
     * @param id - Entity identifier
     * @param data - Partial update data
     * @returns Updated entity
     */
    protected async _update(id: string, data: unknown) {
        const dto = await this.dto.toUpdateDTO(data);
        return await this.dao.update(id, dto);
    }

    /**
     * Protected implementation of delete operation
     * Override this method to add custom business logic to delete operations
     * @param id - Entity identifier
     * @returns Delete operation result
     */
    protected async _delete(id: string) {
        const entity = await this.dao.delete(id);
        return entity;
    }
}
