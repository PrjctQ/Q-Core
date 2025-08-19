import { NextFunction, Response, Request, RequestHandler } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>

export const catchAsync = (reqHandler: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err))
    }
}
