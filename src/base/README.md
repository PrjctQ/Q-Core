# Base

The `base` directory contains the abstract foundation classes that define the core architecture of the framework. These classes implement the Clean Architecture pattern, providing separation of concerns and a standardized way to build scalable APIs. The architecture follows a strict layered approach: DTO → DAO → Service → Controller.

## Architecture Flow

```
HTTP Request → Controller → Service → DAO → Database
HTTP Response ← Controller ← Service ← DAO ← Database
```

## File Index

| File | Purpose | Key Exports |
|------|---------|-------------|
| `baseDatabaseService.ts` | Database connection abstraction | `BaseDatabaseService` |
| `baseDTO.ts` | Data validation and transfer | `BaseDTO`, `DTOConfig` |
| `baseDAO.ts` | Data access abstraction | `BaseDAO`, `DeleteConfig` |
| `baseService.ts` | Business logic layer | `BaseService` |
| `baseController.ts` | HTTP endpoint handlers | `BaseController` |
| `index.ts` | Barrel exports | All base classes |

## Detailed Component Documentation

### 1. BaseDatabaseService (`baseDatabaseService.ts`)
**Purpose**: Abstract class for database connectivity management.

**Responsibilities**:
- Standardizes database connection/disconnection lifecycle
- Provides template for concrete database implementations (Prisma, Mongoose, etc.)
- Ensures consistent connection logging

**Key Methods**:
- `connect()`: Public method that wraps connection logic with logging
- `disconnect()`: Public method that wraps disconnection logic with logging
- `_connect()`: **Abstract** - Database-specific connection implementation
- `_disconnect()`: **Abstract** - Database-specific disconnection implementation

**Usage**: Extend this class to create database-specific service implementations.

### 2. BaseDTO (`baseDTO.ts`) 
**Purpose**: Data Transfer Object for validation and data shaping between layers.

**Responsibilities**:
- Schema validation using Zod
- Data transformation between layers
- Automatic omission of auto-generated fields
- Consistent validation error handling

**Key Features**:
- `toCreateDTO()`: Validates data for create operations, omits auto-generated fields
- `toUpdateDTO()`: Validates data for update operations, adds updatedAt timestamp
- `toJSON()`: Transforms data for client presentation (override to exclude sensitive fields)
- Automatic schema generation for create/update scenarios

**Usage**: Extend to define entity-specific validation rules and data shapes.

### 3. BaseDAO (`baseDAO.ts`)
**Purpose**: Data Access Object for database operations abstraction.

**Responsibilities**:
- Abstracts database-specific query logic
- Provides standardized CRUD operations
- Implements soft delete pattern
- Type-safe database interactions

**Key Features**:
- **Soft Delete Support**: Built-in `isDeleted` flag handling
- **Filter Support**: Standardized filtering across all operations
- **Pagination Ready**: Built-in support for limit/skip options
- **Type Safety**: Full TypeScript generics support

**Operation Methods**:
- `findAll()`: Fetch multiple records with filtering
- `findOne()`: Find single record by criteria
- `findById()`: Find record by primary key
- `insert()`: Create new record
- `update()`: Update existing record
- `delete()`: Soft delete record
- `hardDelete()`: Permanent deletion (protected)

**Abstract Methods** (must be implemented):
- `_create()`, `_findAll()`, `_findUnique()`, `_updateOne()`, `_softDeleteOne()`, `_hardDeleteOne()`

### 4. BaseService (`baseService.ts`)
**Purpose**: Business logic layer that orchestrates between controllers and DAOs.

**Responsibilities**:
- Contains business rules and logic
- Handles data validation using DTOs
- Orchestrates multiple DAO operations
- Standardizes error handling

**Key Features**:
- Automatic DTO validation for all operations
- Consistent error handling (404s, validation errors)
- Extensible through protected methods
- Output formatting standardization

**Extension Points**:
- Override `_create()`, `_update()`, etc. for business logic
- Override `_formatOutput()` to customize response shaping
- Add custom methods for complex business operations

### 5. BaseController (`baseController.ts`)
**Purpose**: HTTP layer that handles request/response cycle.

**Responsibilities**:
- Route handler implementation
- Request parsing and validation
- Response formatting
- Error handling middleware integration

**Built-in Endpoints**:
- `get()`: GET / - List resources with filtering/pagination
- `getById()`: GET /:id - Get single resource
- `post()`: POST / - Create new resource
- `update()`: PUT /:id - Update resource
- `delete()`: DELETE /:id - Delete resource

**Features**:
- Automatic query parameter parsing (filter, limit, skip, sort)
- Built-in `catchAsync` error handling
- Standardized response formatting via `ResponseSender`

## Implementation Example

```typescript
// 1. Define DTO
class UserDTO extends BaseDTO {
  constructor() {
    super({
      baseSchema: z.object({/* schema */}),
      commonFields: { idField: 'id', /* ... */ }
    });
  }
}

// 2. Implement DAO (Use PrismaDAO instead for prisma)
class UserDAO extends BaseDAO<UserDTO, PrismaDatabaseService> {
  protected async _create(data: any) {
    return this.adapter.client.user.create({ data });
  }
  // ... implement other abstract methods
}

// 3. Create Service
class UserService extends BaseService<UserDAO> {
  constructor() {
    super({ dao: userDAO });
  }
}

// 4. Create Controller
class UserController extends BaseController<UserService> {
  constructor() {
    super({ service: userService });
  }
}

// 5. Set up routes
router.get('/users', userController.get);
router.get('/users/:id', userController.getById);
// ... etc
```

## Design Patterns Used

1. **Template Method Pattern**: Base classes provide algorithm structure, subclasses implement specifics
2. **Dependency Injection**: Layers receive dependencies via constructor injection
3. **Separation of Concerns**: Each layer has distinct responsibilities
4. **Soft Delete Pattern**: Built-in logical deletion support
5. **Data Transfer Object**: Validation and data shaping between layers

## Benefits

- **Consistency**: Standardized patterns across all entities
- **Type Safety**: Full TypeScript support throughout all layers
- **Testability**: Easy mocking and testing due to dependency injection
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new database adapters or business logic
- **Security**: Built-in validation and sanitization at every layer
