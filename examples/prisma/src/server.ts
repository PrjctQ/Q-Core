import { Q } from "@prjq/q-core";
import { PrismaClient } from "@prisma/client";
import { app } from "./app";

const prisma = new PrismaClient()
const db = Q.prisma(prisma)
const server = Q.express(app, db)

server.start(3000)
