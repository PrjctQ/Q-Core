import { ApiResponse } from "../interface";
import { ErrorHandler } from "../lib";
import { ErrorFormatter } from "./errorFormater";
import { ResponseSender } from "../utils";
import { Response } from "express";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ErrorResolver {
    private errorHandlers: ErrorHandler[];
    private res: Response;

    constructor(config: {
        res: Response;
        errorHandlers: ErrorHandler[];
    }) {
        this.res = config.res;
        this.errorHandlers = config.errorHandlers;
    }

    public resolve(err: any) {
        const errorHandler = this.errorHandlers.find(handler => handler.check(err));

        let response: ApiResponse;
        if (errorHandler) {
            response = errorHandler.handler(err);
        } else {
            // fallback error
            const errors = ErrorFormatter.formatOtherError(err);
            response = ResponseSender.formatResponse({
                statusCode: 500,
                message: "An unexpected error occurred",
                errors,
                stack:
                    process.env["NODE_ENV"] === "production"
                        ? undefined
                        : err.stack,

            })
        }

        ResponseSender.sendError({
            res: this.res,
            statusCode: response.statusCode,
            message: response.message,
            errors: response.errors,
            stack: response.stack,
        })
    }
}
