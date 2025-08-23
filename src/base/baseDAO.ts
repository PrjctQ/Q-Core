import { BaseDatabaseService } from "./baseDatabaseService";
import { BaseDTO } from "./baseDTO";

// INFO: A DAO or Data Access Object defines how the application
// service communicates with the database and provides a consistent
// way of accessing data from the datababase across the application
// A DAO layer ensures decoupled database operation logic from the
// business logic. It abstracts all database-specific implementation
// details and provides flexibility for database the application uses

// NOTE: This `BaseDAO` class is an ABSTRACT template. It cannot be
// used directly. You must implement extend it to create a concrete
// implementation for a specific database (e.g., MongooseDAO)

/**
 * Abstract base class for Data Access Object (DAO) Provides basic
 * database operations such as `findAll`, `findOne`, `insert`, `update`,
 * 'delete' etc and integrates with `BaseDTO` for type annotation
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
    TDTO extends BaseDTO,
    TDBService extends BaseDatabaseService,
    TEntity = ReturnType<TDTO['toCreateDTO']>,
    TKey = string | number,
> {
    /**
    * The database adapter instance responsible for
    * raw db connectivity and operations
    */
    protected adapter: TDBService;

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
        adapter: TDBService
        dto: TDTO
    }) {
        this.adapter = config.adapter;
        this.dto = config.dto;
    }

    /**
    * Finds all records matching the optional filter.
    * @param filter - key-value pairs to filter the result by.
    * @param options - Database-specific options (e.g., `limit`, `sort`).
    * @param includeDeleted - if `true`, includes soft deleted records. Defaults to `false`.
    * @returns An array of entities.
    */
    public async findAll(
        filter: Partial<TEntity>,
        options: Record<string, unknown> = {},
        includeDeleted: boolean = false,
    ): Promise<TEntity[]> {
        // Filter soft deleted records
        const enhancedFilter = includeDeleted
            ? filter
            : { ...filter, isDeleted: false }

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
        // Filter soft deleted records
        const enhancedFilter = includeDeleted
            ? filter
            : { ...filter, isDeleted: false }

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
        id: TKey,
        options: Record<string, unknown> = {},
        includeDeleted: boolean = false
    ): Promise<TEntity | null> {
        // Filter soft deleted records
        const enhancedFilter = includeDeleted
            ? { id }
            : { id, isDeleted: false }

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
        id: TKey,
        entity: TEntity,
        options?: Record<string, unknown>
    ): Promise<TEntity | null> {
        const result = await this._updateOne(id, entity, options);
        return result;
    }

    /**
     * Soft-deletes a record by its primary key (sets `isDeleted` to true).
     * @param id - The primary key of the record to delete.
     * @param config - Configuration for the delete operation.
     * @param config.returnRecord - If `true`, returns the deleted entity. Defaults to `true`.
     * @returns The deleted entity if `returnRecord` is `true`, otherwise `null`.
     */
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

    /**
     * Permanently deletes a record from the database (hard delete).
     * @param id - The primary key of the record to delete.
     * @param config - Configuration for the delete operation.
     * @param config.returnRecord - If `true`, returns the deleted entity before deletion.
     * @returns The deleted entity if `returnRecord` is `true`, otherwise `null`.
     * @protected This method is protected to discourage its use. Prefer soft delete.
     */
    protected async hardDelete(id: TKey, config?: { returnRecord: boolean }): Promise<TEntity | null> {
        const result = await this._hardDeleteOne(id);
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
        id: TKey,
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
        id: TKey,
        data: Partial<TEntity>,
        options?: Record<string, unknown>
    ): Promise<TEntity | null>;

    /** @abstract Permanently deletes a record (hard delete). */
    protected abstract _hardDeleteOne(id: TKey): Promise<TEntity | null>

    /** @abstract Soft-deletes a record (sets `isDeleted` to true). */
    protected abstract _softDeleteOne(id: TKey): Promise<TEntity | null>
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
