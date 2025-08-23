/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DatabaseClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
}

