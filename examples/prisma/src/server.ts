import { ExpressServer, PrismaService } from "@prjq/q-core";
import { PrismaClient } from "@prisma/client";
import { app } from "./app";

const prisma = new PrismaClient()
const db = PrismaService.init(prisma)
const server = new ExpressServer(app, db)

server.start(3000)
