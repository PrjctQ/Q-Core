import { describe, it, expect } from "vitest";
import { ApiError } from "../../utils";
import { errorCode } from "../../lib";

describe("ApiError", () => {
    const baseErrorConfig = {
        statusCode: 400,
        message: "Test error message",
        path: "body.email",
        errorCode: errorCode.badRequest
    }

    it("should be an instance of Error and ApiError", () => {
        const error = new ApiError(baseErrorConfig)

        expect(error).toBeInstanceOf(Error)
        expect(error).toBeInstanceOf(ApiError)
    })

    it("should correctly assign all properties from the constructor", () => {
        const error = new ApiError(baseErrorConfig)

        expect(error.statusCode).toBe(baseErrorConfig.statusCode)
        expect(error.message).toBe(baseErrorConfig.message)
        expect(error.path).toBe(baseErrorConfig.path)
        expect(error.errorCode).toBe(baseErrorConfig.errorCode)
        expect(error.isOperational).toBe(true) // Testing default value
    })

    it("should allow overriding the isOperation flag", () => {
        const error = new ApiError(baseErrorConfig, false)

        expect(error.isOperational).toBe(false)
    })

    it("should handle an undefined errorCode gracefully", () => {
        const configWithoutErrorCode = {
            statusCode: 500,
            message: "Server error",
            path: "unknown",
            // errorCode omitted
        }

        const error = new ApiError(configWithoutErrorCode)
        expect(error.errorCode).toBeUndefined()
    })

    it("should handle an array for the path property", () => {
        const configWithArrayPath = {
            ...baseErrorConfig,
            path: ["body", "email", "primary"] as string[],
        }

        const error = new ApiError(configWithArrayPath)

        expect(error.path).toEqual(["body", "email", "primary"])
    })

    it("should use a custom stack trace if provided", () => {
        const customStack = "CustomStacktraceLine1\nCustomStacktraceLine2"

        const error = new ApiError(baseErrorConfig, true, customStack)

        expect(error.stack).toBe(customStack)
    })
})
