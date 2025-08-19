import { Server } from "http";
import { Express } from "express";
import { BaseDatabaseService } from "../base/baseDatabaseService";

export class ExpressServer {
  private app: Express;
  private db: BaseDatabaseService | null;
  private server?: Server;
  private maxRetries = 5;
  private attempts = 0;

  constructor(app: Express, db?: BaseDatabaseService) {
    this.app = app;
    this.db = db || null;
    this.handleProcessEvents();
  }

  public async start(port = 3000): Promise<void> {
    try {
      // In ExpressServer.start()
      try {
        await this.db?.connect(); // MUST await this
        if (!this.db) throw new Error("Database service not initialized");
      } catch (error) {
        console.error("Database connection fatal error:", error);
        process.exit(1); // Exit if DB fails
      }

      const tryListen = (port: number) => {
        if (this.server) this.server.close(); // Cleanup previous attempt

        this.server = this.app.listen(port, () => {
          console.info(`Server listening on port ${port}`);
        });

        this.server.on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            this.attempts++;
            if (this.attempts >= this.maxRetries) {
              console.error(`Max retries (${this.maxRetries}) exceeded. Exiting.`);
              this.shutdown();
            } else {
              console.warn(`Port ${port} in use. Trying ${port + 1}...`);
              tryListen(port + 1);
            }
          } else {
            console.error("Server error:", err);
            this.shutdown();
          }
        });
      };

      tryListen(port);
    } catch (err) {
      console.error("Startup failed:", err);
      this.shutdown();
    }
  }

  private handleProcessEvents(): void {
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      this.shutdown();
    });
  }

  public async shutdown(): Promise<void> {
    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server?.close(() => resolve());
        });
      }
      await this.db?.disconnect();
      console.log("Graceful shutdown complete");
    } catch (err) {
      console.error("Shutdown error:", err);
    } finally {
      process.exit(0);
    }
  }
}
