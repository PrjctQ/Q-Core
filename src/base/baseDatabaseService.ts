/**
 * Abstract base class for database service implementations
 * Provides a standardized interface for database connection management
 * across different database providers and ORMs
 * 
 * @abstract
 * @class BaseDatabaseService
 * 
 * @example
 * // Concrete implementation for Prisma
 * class PrismaDatabaseService extends BaseDatabaseService {
 *   private client: PrismaClient;
 *   
 *   constructor() {
 *     super();
 *     this.client = new PrismaClient();
 *   }
 * 
 *   protected async _connect(): Promise<void> {
 *     await this.client.$connect();
 *   }
 * 
 *   protected async _disconnect(): Promise<void> {
 *     await this.client.$disconnect();
 *   }
 * 
 *   public getClient(): PrismaClient {
 *     return this.client;
 *   }
 * }
 * 
 * @example
 * // Usage in application
 * const databaseService = new PrismaDatabaseService();
 * await databaseService.connect(); // Logs "Database connected"
 * // ... application logic
 * await databaseService.disconnect(); // Logs "Database disconnected"
 */
export abstract class BaseDatabaseService {
    /**
     * Establishes connection to the database
     * Wraps the abstract _connect method with connection logging
     * 
     * @returns {Promise<void>} Resolves when connection is established
     * @throws {Error} If connection fails
     */
    public async connect(): Promise<void> {
        await this._connect();
        console.log("Database connected");
    }

    /**
     * Closes the database connection
     * Wraps the abstract _disconnect method with disconnection logging
     * 
     * @returns {Promise<void>} Resolves when connection is closed
     * @throws {Error} If disconnection fails
     */
    public async disconnect(): Promise<void> {
        await this._disconnect();
        console.log("Database disconnected");
    }

    /**
     * Abstract method for database-specific connection logic
     * Must be implemented by concrete subclasses
     * 
     * @protected
     * @abstract
     * @returns {Promise<void>} Resolves when connection is established
     */
    protected abstract _connect(): Promise<void>;

    /**
     * Abstract method for database-specific disconnection logic
     * Must be implemented by concrete subclasses
     * 
     * @protected
     * @abstract
     * @returns {Promise<void>} Resolves when connection is closed
     */
    protected abstract _disconnect(): Promise<void>;
}
