import { PaginationProps } from "../types";
import { BaseDatabaseService } from "./baseDatabaseService";
import { BaseDTO } from "./baseDTO";

/**
 * Abstract base class for Data Access Object (DAO) Provides basic
 * database operations such as `findAll`, `findOne`, `insert`, `update`,
 * 'delete' etc and integrates with `BaseDTO` for type annotation
 *
 * @template TDTO - The DTO class used for validation and transformation
 * @template TEntity - The entity type used in database operations
 *
 * For a ready-made DAO solution for Prisma, use `PrismaDAO` instead
 *
 * @example
 * // Create a DAO for your database
 * class UserDAO extends BaseDAO<UserDTO, MyDatabaseService> {
 *      
 *      // You must write all abstract methods
 *      protected async _create(data) {
 *          // Your code to save 'data' to your database goes here
 *          return await this.adapter.save('users', data);
 *      }
 *      
 *      // ... implement _findAll, _findById etc
 * }
 */
export abstract class BaseDAO<
    TDTO extends BaseDTO = BaseDTO,
    TEntity = ReturnType<TDTO["toCreateDTO"]>,
> {
    /**
    * The database adapter instance responsible for
    * raw db connectivity and operations
    */
    protected adapter: BaseDatabaseService | null;
    // adapter can be null if service locator is used

    /**
    * The DTO instance used for validation and
    * type interface of the entity data
    */
    public readonly dto: TDTO;

    /**
    * Creates an instance of the BaseDAO.
    * @param config - Configuration object for the DAO.
    * @param config.adapter - The dadatabse service adapter (e.g., PrismaService).
    * @param config.dto - The DTO instance for the entity this DAO manages.
    */
    constructor(config: {
        adapter: BaseDatabaseService | null
        dto: TDTO
    }) {
        this.adapter = config.adapter;
        this.dto = config.dto;
    }

    /**
     * Checks if the entity supports soft deletion
     * @returns {boolean} Whether entity supports soft deletion or not
     */
    get supportsSoftDelete(): boolean {
        return !!this.dto.config.autoFields.isDeletedField
    }

    /**
    * Finds all records matching the optional filter.
    * @param filter - key-value pairs to filter the result by.
    * @param options - Database-specific options (e.g., `limit`, `sort`).
    * @param includeDeleted - if `true`, includes soft deleted records. Defaults to `false`.
    * @returns An array of entities.
    */
    public async findAll(
        filter: Partial<TEntity> = {},
        options: Record<string, unknown> & PaginationProps = {},
        includeDeleted: boolean = false,
    ): Promise<TEntity[]> {
        // Filter by entity fields
        let enhancedFilter: Partial<TEntity> = {}

        // Filter out soft deleted record if supported
        if (this.supportsSoftDelete) {
            const isDeletedField = this.dto.config.autoFields.isDeletedField as string

            // Filter soft deleted records
            enhancedFilter = includeDeleted
                ? filter
                : { ...filter, [isDeletedField]: false }
        } else {
            enhancedFilter = filter
        }

        const result = await this._findAll(enhancedFilter, options);
        return result;
    }

    /**
    * Finds a record matching the filter.
    * @param filter - key-value pair to filter the result by.
    * @param options - database-specific options (e.g., `limit`, `sort`).
    * @param includeDeleted - if `true`, includes soft deleted records. Defaults to `false`.
    * @returns The found entity, or `null` if not found.
    */
    public async findOne(
        filter: Partial<TEntity>,
        options: Record<string, unknown> = {},
        includeDeleted: boolean = false
    ): Promise<TEntity | null> {
        // Filter by entity fields
        let enhancedFilter: Partial<TEntity> = {}

        // Filter out soft deleted record if supported
        if (this.supportsSoftDelete) {
            const isDeletedField = this.dto.config.autoFields.isDeletedField as string

            // Filter soft deleted records
            enhancedFilter = includeDeleted
                ? filter
                : { ...filter, [isDeletedField]: false }
        } else {
            enhancedFilter = filter
        }

        const result = await this._findUnique(enhancedFilter, options);
        return result;
    }

    /**
     * Finds a record by its primary key.
     * @param id - The primary key value to search for.
     * @param options - Database-specific options.
     * @param includeDeleted - If `true`, includes soft-deleted records. Defaults to `false`.
     * @returns The found entity, or `null` if not found.
     */
    public async findById(
        id: string,
        options: Record<string, unknown> = {},
        includeDeleted: boolean = false
    ): Promise<TEntity | null> {
        // Filter by entity fields
        let enhancedFilter = {}

        // Filter out soft deleted record if supported
        if (this.supportsSoftDelete) {
            const isDeletedField = this.dto.config.autoFields.isDeletedField as string

            // Filter soft deleted records
            enhancedFilter = includeDeleted
                ? { id }
                : { id, [isDeletedField]: false }
        } else {
            enhancedFilter = { id }
        }

        const result = await this._findUnique(enhancedFilter as TEntity, options)
        return result;
    }

    /**
     * Inserts a new record into the database.
     * @param entity - The entity data to insert. Should be validated by the DTO first.
     * @returns The newly created entity.
     */
    public async insert(entity: TEntity): Promise<TEntity | null> {
        const result = await this._create(entity);
        return result;
    }

    /**
     * Updates an existing record by its primary key.
     * @param id - The primary key of the record to update.
     * @param entity - The data to update.
     * @param options - Database-specific options.
     * @returns The updated entity.
     */
    public async update(
        id: string,
        entity: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity | null> {
        const result = await this._updateOne(id, entity, options);
        return result;
    }

    /**
     * Permanently Deletes a record by its primary key (sets `isDeleted` to true).
     * @param id - The primary key of the record to delete.
     * @param config - Configuration for the delete operation.
     * @param config.returnRecord - If `true`, returns the deleted entity. Defaults to `true`.
     * @returns The deleted entity if `returnRecord` is `true`, otherwise `null`.
     */
    public async delete(
        id: string,
        config: {
            returnRecord: boolean
        } = {
                returnRecord: true
            }
    ): Promise<TEntity | null> {
        const result = await this._hardDeleteOne(id);

        if (config?.returnRecord === true) return result;
        return null;
    }

    /**
     * Restores a record that has previously been soft-deleted
     * @param id - The primary key for the record to restore
     * @returns The entity that has been restored
     */
    public async restore(
        id: string,
    ): Promise<TEntity | null> {
        if (!this.supportsSoftDelete) {
            throw new Error("Restore operation is available only for entities that support soft deletion")
        }

        return await this._restore(id)
    }

    /**
     * Executes an operation within a database transaction context
     * 
     * @template T The return type of the operation
     * @param {function(this): Promise<T>} operation Async function to execute within the transaction. Receives a transactional DAO instance as parameter.
     * @returns {Promise<T>} Promise that resolves with the result of the operation
     * @example
     * const result = await dao.withTransaction(async (transactionalDAO) => {
     *   return await transactionalDAO.create(userData);
     * });
     */
    public async withTransaction<T>(
        operation: (transactionalDAO: this) => Promise<T>
    ): Promise<T> {
        return await this._withTransaction(operation)
    }

    /**
     * Soft-deletes a record from the database (hard delete).
     * @param id - The primary key of the record to delete.
     * @param config - Configuration for the delete operation.
     * @param config.returnRecord - If `true`, returns the deleted entity before deletion.
     * @returns The deleted entity if `returnRecord` is `true`, otherwise `null`.
     */
    async softDelete(id: string, config?: { returnRecord: boolean }): Promise<TEntity | null> {
        if(!this.supportsSoftDelete) {
            throw new Error("This entity doesn't support soft deletion")
        }

        const result = await this._softDeleteOne(id);
        if (config?.returnRecord === true) return result;
        return null;
    }

    // NOTE: The following methods are the core of the DAO pattern.
    // They are abstract and MUST be implemented by a subclass with
    // database-specific logic (e.g., using Prisma, Mongoose, SQL).

    /** @abstract Creates a new record in the database. */
    protected abstract _create(data: TEntity): Promise<TEntity>;

    /** @abstract Finds a record by its primary key. */
    protected abstract _findById(
        id: string,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;

    /** @abstract Finds a unique record based on a filter. */
    protected abstract _findUnique(
        filter: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;

    /** @abstract Finds all records, optionally filtered. */
    protected abstract _findAll(
        filter?: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity[]>;

    /** @abstract Updates one record by its primary key. */
    protected abstract _updateOne(
        id: string,
        data: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;

    /** @abstract Permanently deletes a record (hard delete). */
    protected abstract _hardDeleteOne(id: string): Promise<TEntity | null>

    /** @abstract Soft-deletes a record (sets `isDeleted` to true). */
    protected abstract _softDeleteOne(id: string): Promise<TEntity | null>

    /** @abstract Restores a record that was soft-deleted (sets `isDeleted` to false). */
    protected abstract _restore(id: string): Promise<TEntity | null>

    /** @abstract Performs database transaction */
    protected abstract _withTransaction<T>(
        operation: (transactionalDAO: this) => Promise<T>
    ): Promise<T>
}

/**
 * Configuration options for delete operations.
 */
export interface DeleteConfig {
    /** Whether to return the record that was deleted. */
    returnRecord?: boolean,
    /** Whether to perform a hard (permanent) delete instead of a soft delete. */
    hardDelete?: boolean
}
