import { NextFunction, Response, Request, RequestHandler } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>

/**
 * Wraps an async Express request handler to automatically catch errors
 * and pass them to the next error handling middleware
 * 
 * @example
 * // Instead of using try-catch blocks:
 * router.get('/users', catchAsync(async (req, res) => {
 *   const users = await userService.getUsers();
 *   res.json(users);
 * }));
 * 
 * @param reqHandler - Async Express request handler function
 * @returns Wrapped request handler that automatically handles promise rejection
 */
export const catchAsync = (reqHandler: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err))
    }
}
