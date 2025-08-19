export abstract class BaseDatabaseService {
    public async connect(): Promise<void> {
        await this._connect();
        console.log("Database connected");
    }
    
    public async disconnect(): Promise<void> {
        await this._disconnect();
        console.log("Database disconnected");
    }

    protected abstract _connect(): Promise<void>;
    protected abstract _disconnect(): Promise<void>;
}
