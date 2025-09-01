import { AutoFields, BaseDTO } from "./baseDTO";
import { BaseDAO } from "./baseDAO";
import { PrismaDAO } from "../extensions";
import { BaseService } from "./baseService";
import { BaseController } from "./baseController";
import { ExpressCRUDRouter, ExpressServer, PrismaService } from "../infra";
import { ZodObject, ZodRawShape } from "zod";
import { PrismaClient } from "@prisma/client";
import { Express } from "express";
import { BaseDatabaseService } from "./baseDatabaseService";

// WARN: The current approach of creating crud operation relies on
// `PrismaDAO` and `ExpressCRUDRouter`. These should be replaced with
// generic DAO and CRUDRouter in future.

export class Q {
    public static router(config: IConfig) {
        class DTO extends BaseDTO {
            constructor() {
                super({
                    baseSchema: config.baseSchema,
                    autoFields: config.autoFields
                })
            }
        }

        class DAO extends PrismaDAO {
            constructor() {
                super({
                    modelName: config.name,
                    dto: config.dto || new DTO()
                })
            }
        }

        class Service extends BaseService {
            constructor() {
                super({
                    dao: config.dao || new DAO()
                })
            }
        }

        class Controller extends BaseController {
            constructor() {
                super({
                    service: config.service || new Service()
                })
            }
        }

        class Router extends ExpressCRUDRouter {
            constructor() {
                super({
                    controller: config.controller || new Controller()
                })
            }
        }

        return new Router().router
    }

    public static prisma(prisma: PrismaClient) {
        const db = PrismaService.init(prisma)
        return db
    }

    public static express(app: Express, db?: BaseDatabaseService) {
        const server = new ExpressServer(app, db)
        return server
    }
}

export interface IConfig {
    name: keyof PrismaClient;
    baseSchema: ZodObject<ZodRawShape>;
    autoFields: AutoFields;
    basePath?: string;
    dto?: BaseDTO;
    dao?: BaseDAO;
    service?: BaseService;
    controller?: BaseController;
}
