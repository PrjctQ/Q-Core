# **Q**-Core

An opinionated, Typescript-first meta-framework built on Express.js and Zod. Enables you to build Node.js API with less boilerplate.

> **Note:** The core library is database-agnostic. While it currently provides out-of-the-box support only for Prisma. Support for more ORMs and databases is planned for future releases.

## **Q**uick Start

> **Prerequisite**: A working Prisma setup. This tutorial uses the provided `PrismaDAO` and `PrismaService` which requires @prisma/client and a configured database.

This example creates a fully-typed, production-ready CRUD API for a `User` resource.

### 1. Installation

```bash
npm install @prjq/q-core express zod @prisma/client
```

### 2. Create a database schema

```ts
model user {
  id        String  @unique @default(uuid())
  name      String
  email     String  @unique
}
```

### 3. Create a validation schema

```ts
// user.schema.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
});
```

### 4. Make the magic happen

```ts
// app.ts
import { Q } from "@prjq/q-core";
import { userSchema } from "./user.schema";
import express from "express";

export const app = express();

// Full CRUD API in one line
const userRouter = Q.router({
  name: "user", // Your Prisma model name
  baseSchema: userSchema,
  autoFields: { idField: "id" }, // We'll find the rest automatically
});

app.use("/api/users", userRouter);
```

### 5. Run the app

```ts
import { PrismaClient } from "@prisma/client";
import { Q } from "@prjq/q-core";

const prisma = new PrismaClient();
const db = Q.service(prisma); // Connect the dots

// Optional: Start with our Express setup
const app = express();
const server = Q.express(app, db);
```

### 6. Run Your API

```bash
npm run dev
```

---

Your API now has:

- `GET /api/users` - Get all users
- `POST /api/users` - Create user (with auto-validation!)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## Why You'll Love This

- **✅ Zero Boilerplate** - Stop writing the same CRUD code repeatedly
- **✅ Type-Safe Everything** - Zod + TypeScript = fewer "it worked on my machine" moments
- **✅ Built-in Best Practices** - Validation, error handling, security included
- **✅ Actually Enjoyable** - Because life's too short for repetitive coding

## Ready for More?

Check out our docs for the fancy stuff

- Custom validation hooks
- Authentication integration
- Rate limiting
- And other things that make your API actually production-ready

---

_We welcome contributions from the community! Please remember to follow our [Contributor Guidelines](CONTRIBUTING.md) and respect our [Code of Conduct](CODE_OF_CONDUCT.md)._
