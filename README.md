# Q-Core

An opinionated, Typescript-first meta-framework built on Express.js and Zod. The primary goal is to enfornce a clean, scalable, and strongly typed architecture for backend APIs by providing structured layered pattern and abstracting away common boilerplates

## Core Features

- **Strict Type Safety**: Utilizes **Zod** schemas as the single source of truth for data shapes. This type safety propagates from the database layer (DTO/DAO) through the business logic (Service) and up to the HTTP layer (Controller), ensuring end-to-end validation and autocompletion.
- **Opinionated Layer Architecture**: Mandates a separation of concern through four primary layers:
	1.  **Data Transfer Object (DTO)**: Defined the data schema, validation rules and field mappings using **Zod**.
	2. **Data Access Object (DAO)**: Provides a standardized, generic interface for all CRUD operations against a database. It is abstracted to allow for different ORMs / query builders (e.g. Prisma).
	3. **Service**: Contains the core business logic. It consumes a DAO to perform data operations and applies business rules.
- **Dependency Injection via Constructor**: A simple yet effective form of dependency injection is used. Each layer receives its dependency (the layer below it) explicitly via it's constructor. This makes dependencies clear, easy to mock for testing, and avoids magical global state
- **Centralized and Structured error handling**: The framework implements a sophisticated error handling pipeline. All errors, from validation failures to database exceptions, are caught, normalized, formatted and returned to the client in a consistent JSON structure. This simplifies the debugging and provides a reliable API contract.
- **Security First Defaults**: Includes built-in utilities for authentication (`authGuard`, `authUtils`) and rate limiting, encouraging secure practices from the start.

## Architectural Flow

A typical HTTP request flows as follows:

`HTTP Request -> Express Router -> Validation (DTO) -> Auth Guard -> Controller Method -> Service Method -> DAO Method -> Database`

The response or error then flows back through the same chain in reverse, being handled and formatted in each step.
