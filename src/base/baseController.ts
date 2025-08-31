import { Request, RequestHandler, Response } from "express";
import { BaseService } from "./baseService";
import { catchAsync } from "../utils";
import { ResponseSender } from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Abstract base class for Express controller implementations
 * Provides standardized CRUD endpoint handlers that bridge HTTP layer with service layer
 * Automatically handles async error handling, request parsing, and response formatting
 * 
 * @template TService - Type of the Service layer this controller uses
 * 
 * @example
 * // Concrete controller implementation
 * class UserController extends BaseController<UserService> {
 *   constructor() {
 *     super({ service: userService });
 *   }
 *   
 *   // Optional: Add custom endpoints
 *   public activate: RequestHandler = catchAsync(async (req: Request, res: Response) => {
 *     const result = await this.service.activateUser(req.params.id);
 *     ResponseSender.send({
 *       res,
 *       statusCode: 200,
 *       message: "User activated successfully",
 *       data: result
 *     });
 *   });
 * }
 * 
 * @example
 * // Router setup
 * const userRouter = Router();
 * userRouter.get('/', userController.getAll);
 * userRouter.get('/:id', userController.getById);
 * userRouter.post('/', userController.post);
 * userRouter.put('/:id', userController.update);
 * userRouter.delete('/:id', userController.delete);
 */
export abstract class BaseController<
    TService extends BaseService<any>
> {
    /** Service layer instance for business logic operations */
    protected service: TService;

    /**
     * Creates a new BaseController instance
     * @param config - Controller configuration
     * @param config.service - Service layer instance
     */
    constructor(config: { service: TService }) {
        this.service = config.service;
    }

    /**
     * HTTP GET handler for fetching multiple records
     * Supports filtering, pagination, and sorting via query parameters
     * 
     * @queryParam {string} [filter] - JSON string for filtering criteria
     * @queryParam {number} [limit] - Maximum number of records to return
     * @queryParam {number} [skip] - Number of records to skip (pagination)
     * @queryParam {string} [sort] - JSON string for sorting criteria
     * 
     * @returns {200} Success response with array of records
     */
    public getAll: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const filter = req.query["filter"] ? JSON.parse(String(req.query["filter"])) : {};

            const options: Record<string, unknown> = {}

            const limit = req.query["limit"] ? JSON.parse(String(req.query["limit"])) : undefined;
            const skip = req.query["skip"] ? JSON.parse(String(req.query["limit"])) : undefined;
            const sort = req.query["sort"] ? JSON.parse(String(req.query["sort"])) : undefined;

            if (limit) options["limit"] = limit;
            if (skip) options["skip"] = skip;
            if (sort) options["sort"] = sort;

            const result = await this.service.findAll(filter, options);

            ResponseSender.send({
                res,
                statusCode: 200,
                message: "Successfully fetched data",
                data: result,
            })
        }
    )

    /**
     * HTTP GET handler for fetching a single record by ID
     * 
     * @param {string} id - Record identifier from URL path
     * @returns {200} Success response with the requested record
     * @returns {404} Error response if record not found
     */
    public getById: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const id = req.params["id"] as string;
            const result = await this.service.findById(id);

            ResponseSender.send({
                res,
                statusCode: 200,
                message: "Successfully fetched data",
                data: result,
            })
        }
    )

    /**
     * HTTP POST handler for creating a new record
     * 
     * @body {any} data - Record data to create
     * @returns {201} Success response with the created record
     */
    public post: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const data = req.body;
            const result = await this.service.create(data);

            ResponseSender.send({
                res,
                statusCode: 201,
                message: "Successfully created data",
                data: result,
            })
        }
    )

    /**
     * HTTP PUT handler for updating an existing record
     * 
     * @param {string} id - Record identifier from URL path
     * @body {any} data - Partial data to update
     * @returns {200} Success response with the updated record
     */
    public update: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const data = req.body;
            const id = req.params["id"] as string;
            const result = await this.service.update(id, data);

            ResponseSender.send({
                res,
                statusCode: 200,
                message: "Successfully updated data",
                data: result,
            })
        }
    )

    /**
     * HTTP DELETE handler for removing a record
     * 
     * @param {string} id - Record identifier from URL path
     * @returns {200} Success response with the deletion result
     */
    public delete: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const id = req.params["id"] as string;
            const result = await this.service.delete(id);

            ResponseSender.send({
                res,
                statusCode: 200,
                message: "Successfully deleted data",
                data: result,
            })
        }
    )
}
