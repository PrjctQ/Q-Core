import { ErrorCode } from "../lib";

export class ApiError extends Error {
    public statusCode: number;
    public errorCode?: ErrorCode;
    public path?: string | string[];
    public isOperational: boolean;

    constructor(
        error: {
            statusCode: number,
            message: string,
            path?: string | string[];
            errorCode?: ErrorCode;
        },
        isOperational = true,
        stack = ''
    ) {
        super(error.message);
        this.statusCode = error.statusCode;
        this.path = error.path;
        this.errorCode = error.errorCode!;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
