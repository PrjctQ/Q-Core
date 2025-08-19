import { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError, catchAsync } from "../utils";
import { errorCode } from "../lib";
import { AuthUtils } from "../utils/authUtils";

export const authGuard: RequestHandler = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {

    // Check if token is provided
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ApiError({
        statusCode: 401,
        message: "Missing Authorizaiton Headers",
        errorCode: errorCode.unauthorized,
      })
    }

    // Seperating 'Bearer' keyword from token
    const token = authHeader.split(' ')[1]

    try {
      const payload = AuthUtils.verifyToken(token as string)
      req.user = payload;
      next();
    } catch {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid token",
        path: "header",
        errorCode: errorCode.unauthorized,
      })
    }

  }
)
