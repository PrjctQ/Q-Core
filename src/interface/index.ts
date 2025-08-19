/* eslint-disable @typescript-eslint/no-explicit-any */
export * from "./databaseService"

import { JwtPayload } from "jsonwebtoken";
import { ErrorCode } from "../lib/errorCode"

declare module "express" {
    interface Request {
        traceId?: string;
        user?: JwtPayload;
    }
}

export interface ApiResponse<T = undefined> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    errors?: ErrorMessage[];
    stack?: string;
}

export interface ErrorMessage {
    path: string | string[];
    message: string;
    code: ErrorCode;
}

export interface IEventBus<Events extends Record<string, any>> {
    on<K extends keyof Events>(
        eventName: K,
        handler: (payload: Readonly<Events[K]>) => void | Promise<void>
    ): void
    off<K extends keyof Events>(
        eventName: K, handler: (payload: Readonly<Events[K]>) => void | Promise<void>
    ): void
    emit<K extends keyof Events>(
        eventName: K, eventHandler: Readonly<Events[K]>
    ): Promise<void>
}
