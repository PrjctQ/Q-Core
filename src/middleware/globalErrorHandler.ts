/*eslint-disable @typescript-eslint/no-explicit-any*/

import { ErrorResolver } from "../error";
import { NextFunction, Request, Response } from "express";
import { errorHandlers } from "../lib";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResolver = new ErrorResolver({
    res,
    errorHandlers: errorHandlers
  });

  errorResolver.resolve(err);

  next();
}
