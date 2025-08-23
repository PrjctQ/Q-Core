import { ErrorCode } from "../lib";

/**
 * Custom error class for standardized API error handling
 * Extends the native JavaScript Error class to include
 * additional metadata relevant for HTTP API responses
 * 
 * @example
 * // Throw a 404 Not Found error
 * throw new ApiError({
 *   statusCode: 404,
 *   message: "User not found",
 *   path: "params.id",
 *   errorCode: ErrorCode.notFound
 * });
 * 
 * @example
 * // Throw a 400 Bad Request error
 * throw new ApiError({
 *   statusCode: 400,
 *   message: "Invalid email format",
 *   path: "body.email",
 *   errorCode: ErrorCode.badRequest
 * });
 */
export class ApiError extends Error {
    /**
     * HTTP status code for the error response (e.g., 400, 404, 500)
     */
    public statusCode: number;
    
    /**
     * Application-specific error code for precise error identification
     */
    public errorCode?: ErrorCode;
    
    /**
     * Path or field where the error occurred (e.g., 'body.email', 'params.id')
     * Useful for client-side form validation highlighting
     */
    public path?: string | string[];
    
    /**
     * Flag indicating whether this is an operational error (expected) 
     * or a programming error (unexpected)
     */
    public isOperational: boolean;

    /**
     * Creates a new ApiError instance
     * @param error - Error configuration object
     * @param error.statusCode - HTTP status code
     * @param error.message - Human-readable error message
     * @param error.path - Path or field where error occurred
     * @param error.errorCode - Application-specific error code
     * @param isOperational - Whether this is an operational error (default: true)
     * @param stack - Optional custom stack trace
     */
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
