import { ApiResponse } from "../interface";
import { ErrorFormatter } from "../error";
import { ResponseSender, ApiError } from "../utils";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { errorCode } from "./errorCode";
import { ZodError } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ErrorHandler {
    check: (err: any) => boolean;
    handler: (err: any) => ApiResponse;
}

export const errorHandlers: ErrorHandler[] = [
    {
        check: (err) => err instanceof PrismaClientKnownRequestError && err.code === "P2002",
        handler: (err) => {
            const errors = ErrorFormatter.duplicateEntry(err);
            return ResponseSender.formatResponse({
                statusCode: 409,
                message: "Conflict",
                errors,
            });
        },
    },
    {
        check: (err) => err instanceof PrismaClientKnownRequestError && err.code === "P2003",
        handler: (err) => {
            const errors = ErrorFormatter.foreignKeyConstraint(err)
            return ResponseSender.formatResponse({
                statusCode: 409,
                message: "Conflict",
                errors,
            });
        }
    },
    {
        check: (err) => err instanceof PrismaClientKnownRequestError && err.code === "P2025",
        handler: (err) => {
            const errors = ErrorFormatter.notFound(err);

            return ResponseSender.formatResponse({
                statusCode: 404,
                message: "Not Found",
                errors,
            });
        },
    },
    {
        check: (err) => err instanceof PrismaClientInitializationError,
        handler: () => {
            return ResponseSender.formatResponse({
                statusCode: 503,
                message: "Service Unavailable",
                errors: [
                    {
                        path: "database",
                        message: "Database not initialized",
                        code: errorCode.database,
                    }
                ]
            });
        }
    },
    {
        check: (err) => err instanceof PrismaClientKnownRequestError,
        handler: () => {
            const errors = ErrorFormatter.databaseError();
            return ResponseSender.formatResponse({
                statusCode: 404,
                message: "Not Found",
                errors,
            });
        },
    },
    {
        check: (err) => err instanceof ZodError,
        handler: (err) => {
            const errors = ErrorFormatter.zodError(err);
            return ResponseSender.formatResponse({
                statusCode: 400,
                message: "Validation Error",
                errors,
            })
        },
    },
    // {
    //     check: (err) => err && Array.isArray(err.errors),
    //     handler: (err) => {
    //         const errors = ErrorFormatter.formatValidationErrors(err.errors);
    //         return {
    //             success: false,
    //             statusCode: 400,
    //             message: "Validation error",
    //             errors,
    //         };
    //     },
    // },
    {
        check: (err) => err instanceof SyntaxError,
        handler: (err) => {
            const errors = ErrorFormatter.invalidJSON(err);
            return ResponseSender.formatResponse({
                statusCode: 400,
                message: "Invalid JSON",
                errors,
            });
        },
    },
    {
        check: (err) => err instanceof ZodError,
        handler: (err) => {
            const errors = ErrorFormatter.zodError(err.validatedError);
            return ResponseSender.formatResponse({
                statusCode: err.statusCode,
                message: err.message,
                errors,
                stack: process.env["NODE_ENV"] === "production"
                    ? undefined
                    : err.stack
            })
        },
    },
    {
        check: (err) => err instanceof ApiError,
        handler: (err) => {
            const errors = ErrorFormatter.apiError(err);
            return ResponseSender.formatResponse({
                statusCode: err.statusCode,
                message: err.message,
                errors,
                stack:
                    process.env["NODE_ENV"] === "production"
                        ? undefined
                        : err.stack,
            })
        },
    },
    {
        check: (err) => err instanceof Error, // Catch any custom errors thrown
        handler: (err) => {
            const errors = ErrorFormatter.formatGenericError(err);
            return ResponseSender.formatResponse({
                statusCode: 500,
                message: "Internal Server Error",
                errors,
                stack:
                    process.env["NODE_ENV"] === "production"
                        ? undefined
                        : err.stack,
            })
        },
    },

]
