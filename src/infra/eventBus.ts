import { IEventBus } from "../interface";

/* eslint-disable @typescript-eslint/no-explicit-any */

type EventHandler<T = any> = (payload: Readonly<T>) => void | Promise<void>;

export class EventBus<Events extends Record<string, any>> implements IEventBus<Events> {
    private handlers: Map<keyof Events, EventHandler<any>[]> = new Map();

    public on<K extends keyof Events>(
        eventName: K,
        handler: EventHandler<Events[K]>
    ): void {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }
        this.handlers.get(eventName)!.push(handler);
    }

    public off<K extends keyof Events>(
        eventName: K, handler: EventHandler<Events[K]>
    ): void {
        const handlers = this.handlers.get(eventName);
        if (!handlers) return
        this.handlers.set(eventName, handlers.filter(h => h !== handler));
    }

    public async emit<K extends keyof Events>(
        eventName: K, payload: Readonly<Events[K]>
    ): Promise<void> {
        const handlers = this.handlers.get(eventName);
        if (!handlers) return;
        await Promise.all(
            handlers.map(handler => handler(payload))
        )
    }
}
