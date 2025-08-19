export interface DatabaseService {
    connect():  Promise<void>
    disconnect(): Promise<void>
}
