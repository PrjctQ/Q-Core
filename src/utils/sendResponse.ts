import { CookieOptions, Response } from "express"
import { TErrorResponse } from "../error";
import { ApiResponse } from "../interface";

/**
 * Centralized response handling utility for standardized API responses
 * Provides consistent response formatting, cookie management, and error handling
 * across all API endpoints. Ensures uniform response structure for both
 * successful and error responses.
 * 
 * @class ResponseSender
 * @hideconstructor - Static class, no public constructor
 */
export class ResponseSender {
    private constructor() { }

    /** @private */
    private static readonly isDevMode = process.env["NODE_ENV"] !== "production";

    /**
     * Sends a standardized successful API response
     * Automatically sets success flag based on status code and handles cookie management
     * 
     * @static
     * @template T - Type of the data payload
     * @param {ResponseParams<T>} params - Response configuration parameters
     * @param {Response} params.res - Express Response object
     * @param {number} params.statusCode - HTTP status code (200-299 for success)
     * @param {string} params.message - Human-readable success message
     * @param {T} [params.data] - Optional data payload to include in response
     * @param {CookieParams[]} [params.cookies] - Optional cookies to set in response
     * 
     * @example
     * // Basic success response
     * ResponseSender.send({
     *   res: response,
     *   statusCode: 200,
     *   message: "User retrieved successfully",
     *   data: userData
     * });
     * 
     * @example
     * // Success response with cookies
     * ResponseSender.send({
     *   res: response,
     *   statusCode: 201,
     *   message: "User created successfully",
     *   data: newUser,
     *   cookies: [{
     *     name: "auth_token",
     *     value: jwtToken,
     *     options: { httpOnly: true, secure: true }
     *   }]
     * });
     */
    public static send = <T>({
        res,
        statusCode,
        message,
        data,
        cookies
    }: ResponseParams<T>) => {
        const response: ApiResponse<T> = {
            success: statusCode >= 200 && statusCode < 300,
            statusCode,
            message,
            data,
        }

        if (cookies) {
            cookies.forEach(cookie => {
                res.cookie(cookie.name, cookie.value, cookie.options);
            })
        }

        res.status(statusCode).json(response);
    }

    /**
     * Sends a standardized error response with detailed error information
     * Includes stack traces in development environment for debugging
     * 
     * @static
     * @param {ErrorParams} params - Error response configuration
     * @param {Response} params.res - Express Response object
     * @param {number} params.statusCode - HTTP error status code (400-599)
     * @param {string} params.message - Human-readable error message
     * @param {TErrorResponse} params.errors - Detailed error information
     * @param {string} [params.stack] - Error stack trace (automatically included in dev)
     * @param {CookieParams[]} [params.cookies] - Optional cookies to set with error response
     * 
     * @example
     * // Validation error response
     * ResponseSender.sendError({
     *   res: response,
     *   statusCode: 400,
     *   message: "Validation failed",
     *   errors: {
     *     email: "Invalid email format",
     *     password: "Password must be at least 8 characters"
     *   }
     * });
     * 
     * @example
     * // Server error with stack trace (development only)
     * ResponseSender.sendError({
     *   res: response,
     *   statusCode: 500,
     *   message: "Internal server error",
     *   errors: { server: "Database connection failed" },
     *   stack: error.stack
     * });
     */
    public static sendError = ({
        res,
        statusCode,
        message,
        errors,
        cookies,
        stack
    }: ErrorParams) => {
        const response: ApiResponse = {
            success: false,
            statusCode,
            message,
            errors,
        }
        if (stack && this.isDevMode) response.stack = stack;

        if (cookies) {
            cookies.forEach(cookie => {
                res.cookie(cookie.name, cookie.value, cookie.options);
            })
        }

        res.status(statusCode).json(response);
    }

    /**
     * Formats a response object without sending it to the client
     * Useful for testing, logging, or custom response handling scenarios
     * 
     * @static
     * @template T - Type of the data payload
     * @param {Object} params - Response formatting parameters
     * @param {number} params.statusCode - HTTP status code
     * @param {string} params.message - Response message
     * @param {T} [params.data] - Optional success data payload
     * @param {TErrorResponse} [params.errors] - Optional error details
     * @param {string} [params.stack] - Optional stack trace (included in dev only)
     * @returns {ApiResponse<T>} Formatted response object
     * 
     * @example
     * // Format success response for testing
     * const response = ResponseSender.formatResponse({
     *   statusCode: 200,
     *   message: "Success",
     *   data: { id: 1, name: "John Doe" }
     * });
     * 
     * @example
     * // Format error response for logging
     * const errorResponse = ResponseSender.formatResponse({
     *   statusCode: 404,
     *   message: "Not found",
     *   errors: { resource: "User not found" },
     *   stack: error.stack
     * });
     */
    public static formatResponse = <T>({
        statusCode,
        message,
        data,
        errors,
        stack
    }: {
        statusCode: number,
        message: string,
        data?: T,
        errors?: TErrorResponse,
        stack?: string,
    }) => {
        const response: ApiResponse<T> = {
            success: statusCode >= 200 && statusCode < 300,
            statusCode,
            message,
        }

        if (data && !errors) response.data = data;
        if (errors) response.errors = errors;
        if (stack && this.isDevMode) response.stack = stack;

        return response;
    }
}

/**
 * @interface ResponseParams
 * @template T
 * @description Configuration parameters for successful responses
 */
interface ResponseParams<T> {
    /** Express Response object */
    res: Response;
    /** HTTP status code (200-299) */
    statusCode: number;
    /** Human-readable success message */
    message: string;
    /** Optional data payload */
    data?: T;
    /** Optional cookies to set in response */
    cookies?: CookieParams[];
}

/**
 * @interface ErrorParams
 * @description Configuration parameters for error responses
 */
interface ErrorParams {
    /** Express Response object */
    res: Response;
    /** HTTP error status code (400-599) */
    statusCode: number;
    /** Human-readable error message */
    message: string;
    /** Detailed error information */
    errors: TErrorResponse;
    /** Error stack trace (included in development only) */
    stack?: string;
    /** Optional cookies to set with error response */
    cookies?: CookieParams[];
}

/**
 * @interface CookieParams
 * @description Cookie configuration parameters
 */
interface CookieParams {
    /** Cookie name */
    name: string,
    /** Cookie value */
    value: string,
    /** Cookie options (httpOnly, secure, expires, etc.) */
    options: CookieOptions
}
