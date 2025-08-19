import { CookieOptions, Response } from "express"
import { TErrorResponse } from "../error";
import { ApiResponse } from "../interface";

export class ResponseSender {
    private constructor() { }

    private static readonly isDevMode = process.env["NODE_ENV"] !== "production";

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

interface ResponseParams<T> {
    res: Response;
    statusCode: number;
    message: string;
    data?: T;
    cookies?: CookieParams[];
}

interface ErrorParams {
    res: Response;
    statusCode: number;
    message: string;
    errors: TErrorResponse;
    stack?: string;
    cookies?: CookieParams[];
}

interface CookieParams {
    name: string,
    value: string,
    options: CookieOptions
}
