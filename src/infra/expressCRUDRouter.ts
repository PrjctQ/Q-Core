import { BaseController } from "@/base"
import { RequestHandler, Router, Request, Response, NextFunction } from "express"


/**
 * Creates route from BaseController
 *
 * @template TController - Type of the route
 */
export class ExpressCRUDRouter<
    TController extends BaseController = BaseController
> {
    private readonly controller: TController
    private readonly _router: Router;
    private readonly basePath: string;

    constructor(config: Config<TController>) {
        this.controller = config.controller
        this.basePath = config.basePath || "/"
        this._router = Router()

        if (!config.disableDefaultRoutes) {
            this._registerCRUDRoutes()
        }
        if (config.routes?.length) {
            this.registerRoutes(config.routes)
        }
    }

    /**
    * Gets the apiRouter for registered resources
    */
    public get router(): Router {
        return this._router
    }

    /**
    * Registers a custom router
    *
    * @param path - Path where the resource should be available
    * @param method - HTTP method (e.g, get, post, ...)
    * @param controller - Controller for the route
    * @param middlewares - Array of middlewares
    */
    public registerRoute(
        path: string,
        method: HTTPMethods,
        handler: RequestHandler,
        middlewares: RequestHandler[] = []
    ): this {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const fullPath = this.basePath === "/" ? normalizedPath : `${this.basePath}${normalizedPath}`
        this._router[method](fullPath, ...middlewares, this._catchAsync(handler))
        
        return this
    }

    /**
     * Registers multiple routes at once
     */
    public registerRoutes(routes: IRoute[]): void {
        routes.forEach(({ path, method, handler, middlewares }) => {
            this.registerRoute(path, method, handler, middlewares)
        })
    }

    /**
    * Registeres basic CRUD operation for the default controller
    */
    private _registerCRUDRoutes(): void {
        const controller = this.controller;

        const routes: IRoute[] = [
            { path: `/`, method: "get", handler: controller.getAll },
            { path: `/:id`, method: "get", handler: controller.getById },
            { path: `/`, method: "post", handler: controller.post },
            { path: `/:id`, method: "put", handler: controller.update },
            { path: `/:id`, method: "delete", handler: controller.delete }
        ]

        this.registerRoutes(routes)
    }

    public mergeRouter(router: Router, path?: string): this {
        if (path) {
            this._router.use(path, router)
        } else {
            this._router.use(router)
        }

        return this;
    }

    private _catchAsync(handler: RequestHandler): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            return Promise.resolve(handler(req, res, next)).catch(err => next(err))
        }
    }

    /**
     * Get all registered router paths (for debugging purposes)
     */
    public getRegisteredRoutes(): string[] {
        const routes: string[] = []

        this._router.stack.forEach(layer => {
            if (layer.route) {
                layer.route.stack.forEach(routeLayer => {
                    routes.push(`${Object.keys(routeLayer.method)[0]?.toUpperCase()} ${this.basePath}${layer.route!.path}`)
                })
            }
        })

        return routes
    }
}

export type HTTPMethods = "get" | "post" | "put" | "patch" | "delete" | "head" | "options"

export type IRoute = {
    path: string,
    method: HTTPMethods,
    handler: RequestHandler,
    middlewares?: RequestHandler[]
}

export type Config<T> = {
    controller: T,
    basePath?: string,
    disableDefaultRoutes?: boolean
    routes?: IRoute[]
}
