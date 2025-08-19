import { ApiResponse } from "../interface";
import { errorCode } from "../lib";
import { ZodError } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type TErrorResponse = ApiResponse["errors"];
export interface IPrismaDBError {
    meta: {
        target?: string;
        modelName?: string;
        field_name?: string;
        cause?: string;
    };
    code?: string;
    clientVersion?: string;
}

export class ErrorFormatter {
    static duplicateEntry(error: any): TErrorResponse {
        const part = error.meta?.target?.split("_") || [];
        const field = part.length > 1 ? part[part.length - 2] : "unknown";

        return [
            {
                path: field,
                message: "Provide unique entry",
                code: "DUPLICATE_ENTRY",
            },
        ];
    }

    static foreignKeyConstraint(error: any): TErrorResponse {
        const field = error.meta.field_name;
        const model = error.meta.modelName;

        return [
            {
                path: [model, field],
                message: "Foreign key constraint failed",
                code: errorCode.foreignConstraint,
            },
        ];
    }

    static notFound(error: any): TErrorResponse {
        const cause = error.meta.cause;
        const path = error.meta.modelName;
        return [
            {
                path,
                message: cause,
                code: errorCode.notFound,
            },
        ];
    }

    static databaseError(): TErrorResponse {
        return [
            {
                path: "database",
                message: "A database error occurred",
                code: errorCode.database,
            },
        ];
    }

    static zodError(error: ZodError): TErrorResponse {
        return error.issues.map((issue) => ({
            path: issue.path.join(".") || "unknown",
            message: issue.message,
            code: errorCode.validation,
        }));
    }

    static prismaValidationError(error: any): TErrorResponse {
        // Parse the error message to extract relevant information
        const message = error.message || "";
        
        // Match field names that have invalid values
        const fieldMatch = message.match(/Invalid value for (?:argument|field) `([^`]+)`/);
        const field = fieldMatch ? fieldMatch[1] : "unknown";
        
        // Extract the specific error reason
        let errorReason = message.split('\n').pop()?.trim() || "Invalid input provided";
        if (errorReason.includes('Got invalid value')) {
            errorReason = errorReason.split('Got invalid value')[1].trim();
        }

        return [
            {
                path: field,
                message: errorReason,
                code: errorCode.validation,
            },
        ];
    }

    static invalidJSON(err: any): TErrorResponse {
        return [
            {
                path: err.path || "body",
                message: err.message || "Invalid JSON body provided",
                code: errorCode.badRequest,
            },
        ];
    }

    static formatGenericError(error: any): TErrorResponse {
        // Check if it's a Prisma validation error
        if (error.name === 'PrismaClientValidationError') {
            return this.prismaValidationError(error);
        }

        return [
            {
                path: error.path || "unknown",
                message: error.message || "An unexpected error occurred",
                code: errorCode.unknown,
            },
        ];
    }

    static formatHttpError(error: any): TErrorResponse {
        return [
            {
                path: "server",
                message: error.message || "An internal server error occurred",
                code: errorCode.internalError,
            },
        ];
    }

    static apiError(error: any): TErrorResponse {
        return [
            {
                path: error.path || "unknown",
                message: error.message,
                code: error.errorCode || errorCode.unknown,
            },
        ];
    }

    static formatOtherError(error: any): TErrorResponse {
        // Handle specific Prisma error codes
        if (error.code) {
            switch (error.code) {
                case 'P2002':
                    return this.duplicateEntry(error);
                case 'P2003':
                    return this.foreignKeyConstraint(error);
                case 'P2025':
                    return this.notFound(error);
                case 'P1012':
                    return this.prismaValidationError(error);
            }
        }

        // Handle by error name if code isn't available
        if (error.name === 'PrismaClientValidationError') {
            return this.prismaValidationError(error);
        }

        return [
            {
                path: "unknown",
                message: error.message || "An unknown error occurred",
                code: errorCode.unknown,
            },
        ];
    }
}
