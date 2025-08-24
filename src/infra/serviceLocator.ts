/**
 * A simple Service Locator for managing dependencies.
 * 
 * Services are stored in a static map and can be registered,
 * retrieved, or cleared globally.
 *
 * ⚠️ Use with care: Service Locator is considered an anti-pattern in some designs
 * because it hides dependencies. Prefer dependency injection where possible.
 */
export class ServiceLocator {
    /**
    * Internal registry of services.
    * the key is string, and service can be any type.
    */
    private static services: Map<string, unknown> = new Map()

    /**
    * Registers a service instance under a specific key.
    *
    * @typeParam T - The type of the service being registered.
    * @param {string} key - Unique key to identify the service.
    * @param {T} service - The service instance to register.
    *
    * @example
    * ```ts
    * ServiceLocator.register("logger", new Logger())
    * ```
    */
    static register<T>(key: string, service: T): void {
        this.services.set(key, service)
    }

    /**
    * Retreives a service instance using a key
    *
    * @typeParam T - The type of the service being retrieved
    * @param {string} key - Unique key to identify the service
    * @returns {T} The service instance
    * @throws {Error} If the service instance is not registered
    */
    static get<T>(key: string): T {
        const service = this.services.get(key) // Retrieve service

        // Throw error if not registered
        if (!service) {
            throw Error(`Service ${key} not registered`)
        }

        return service as T
    }

    /**
    * Clears all registered services
    * Useful for resetting the service container in tests or app shutdown
    */
    static clean(): void {
        this.services.clear()
    }
}
