import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils";

describe("catchAsync", () => {
    let mockRequest: Request;
    let mockResponse: Response;
    let mockNext: NextFunction;

    let nextSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockRequest = {} as Request;
        mockResponse = {} as Response;

        nextSpy = vi.fn();
        mockNext = nextSpy;
    })

    it("should call the provided async request handler and NOT call next if it resolves", async () => {
        const mockRequestHandler = vi.fn().mockResolvedValue("success_result");
        const wrappedHandler = catchAsync(mockRequestHandler);

        await wrappedHandler(mockRequest, mockResponse, mockNext);

        expect(mockRequestHandler).toHaveBeenCalled();
        expect(mockRequestHandler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
        expect(nextSpy).not.toHaveBeenCalled();
    })

    it("should catch an error from the async handler and pass it to next", async () => {
        const mockError = new Error("Database connection failed");
        const mockFailingHandler = vi.fn().mockRejectedValue(mockError);

        const failingHandler = catchAsync(mockFailingHandler);

        await failingHandler(mockRequest, mockResponse, mockNext);

        expect(mockFailingHandler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
        expect(nextSpy).toHaveBeenCalledOnce();
        expect(nextSpy).toHaveBeenCalledWith(mockError)
    })

    it("should catch a synchronously thrown error and pass it to next", () => {

    })
})
