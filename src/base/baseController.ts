import { Request, RequestHandler, Response } from "express";
import { BaseService } from "./baseService";
import { catchAsync } from "../utils";
import { FindOptions } from "./baseDAO";
import { ResponseSender } from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class BaseController<
    TService extends BaseService<any>
> {
    protected service: TService;

    constructor(config: { service: TService }) {
        this.service = config.service;
    }

    public get: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const filter = req.query["filter"] ? JSON.parse(String(req.query["filter"])) : {};

            const options: FindOptions = {}

            const limit = req.query["limit"] ? JSON.parse(String(req.query["limit"])) : undefined;
            const skip = req.query["skip"] ? JSON.parse(String(req.query["limit"])) : undefined;
            const sort = req.query["sort"] ? JSON.parse(String(req.query["sort"])) : undefined;

            if (limit) options.limit = limit;
            if (skip) options.skip = skip;
            if (sort) options.sort = sort;

            const result = await this.service.findAll(filter, options);

            ResponseSender.send({
                res,
                statusCode: 200,
                message: "Successfully fetched data",
                data: result,
            })
        }
    )

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

    public delete: RequestHandler = catchAsync(
        async (req: Request, res: Response) => {
            const id = req.params["id"] as string;
            console.log("deleted", id);
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
