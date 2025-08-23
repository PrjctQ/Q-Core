import type { PrismaClient, Prisma } from "@prisma/client";
import { BaseDatabaseService } from "../base/baseDatabaseService";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class PrismaService extends BaseDatabaseService {
    private static instance: PrismaService | null = null;
    private prisma: PrismaClient;

    private constructor(prisma: PrismaClient) {
        super();
        this.prisma = prisma;
    }

    /**
     * Initialize a global PrismaService singleton with a PrismaClient
     */
    public static init(prisma: PrismaClient): PrismaService {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService(prisma);
        }
        return PrismaService.instance;
    }

    /**
     * Get the global PrismaService instance.
     * Throws if not initialized.
     */
    public static getInstance(): PrismaService {
        if (!PrismaService.instance) {
            throw new Error(
                "PrismaService not initialized. Call PrismaService.init(new PrismaClient()) first."
            );
        }
        return PrismaService.instance;
    }

    public async transaction<T = any>(
        txf: (tx: Prisma.TransactionClient) => Promise<T>
    ): Promise<T> {
        return this.prisma.$transaction(txf);
    }

    public get client(): PrismaClient {
        return this.prisma;
    }

    protected async _connect() {
        await this.prisma.$connect();
    }

    protected async _disconnect() {
        await this.prisma.$disconnect();
    }


    // private async __initializeSuperAdmin() {
    //     const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "admin@todo.com"
    //     const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "admin123"
    //
    //     try {
    //         const existingAdmin = await this.prisma.user.findUnique({
    //             where: { email: SUPERADMIN_EMAIL }
    //         })
    //
    //         if (!existingAdmin) {
    //             console.log("Creating super admin...")
    //             const result = await this.prisma.user.create({
    //                 data: {
    //                     name: "Super Admin",
    //                     email: SUPERADMIN_EMAIL,
    //                     role: systemRole.SUPERADMIN,
    //                     password: await AuthUtils.hashPassword(SUPERADMIN_PASSWORD)
    //                 }
    //             })
    //             if (result) console.log("Successfully created super admin")
    //         }
    //     } catch (error) {
    //         console.log("Super admin initialization failed:", error)
    //     }
    // }
}
