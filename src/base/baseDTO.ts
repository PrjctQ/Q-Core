import z, { ZodObject, ZodError, ZodRawShape } from "zod";
import { ApiError } from "../utils";
import { errorCode } from "../lib";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Abstract base class for Data Transfer Object (DTO)
 * Provides common functionality for creating and updating
 * DTOs with Zod validation
 *
 * @example
 * // Create a DTO for a user entity 
 * class UserDTO extends BaseDTO {
 *    constructor() {
 *        super({
 *            baseSchema: z.object({
 *                id: z.string(),
 *                email: z.string().email(),
 *                password: z.string().min(8),
 *                createdAt: z.date(),
 *                updatedAt: z.date()
 *            }),
 *            commonFields: {
 *                idField: "id",
 *                createdAtField: "createdAt",
 *                updatedAtField: "updatedAt",
 *                isDeletedField: "isDeleted"
 *            }
 *        })
 *    }
 * }
 *
 * @example
 * // Use the DTO
 * const userDTO = new UserDTO()
 * const createData = userDTO.toCreateDTO({
 *    email: "user@example.com",
 *    password: "password123"
 * })
 *
 * // `createData` is now validated and will NOT have auto
 * // generated fields like `id` which is perfect for transfering
 * // data to the database to create an entity
 */
export abstract class BaseDTO {

  // NOTE: BaseDTO is a helper tool created to take unvalidated input
  // from HTTP request body and validate against a Zod schema and
  // produce a clean, typed object that can be used by the rest of
  // the application

  // NOTE: Adds a layer of abstraction and may have a minor
  // performance cost due to validation overhead

  public config: DTOConfig;

  /**
   * Creates an instance of BaseDTO
   * @param config - DTO configuration object
   */
  constructor(config: DTOConfig) {
    this.config = config;
  }

  /**
   * Converts an entity to a create DTO by validating against the create schema
   * @param entity - The entity data to convert
   * @returns Validated create DTO
   * @throws {@link ZodError} If validation fails
   */
  toCreateDTO(entity: unknown) {
    return this.parse(this.createSchema, entity);
  }

  /**
   * Converts an entity to an update DTO by validating against the update schema
   * Automatically injects updatedAt timestamp if configured
   * @param entity - The entity data to convert
   * @returns Validated update DTO
   * @throws {@link ApiError} If no fields are provided for update
   * @throws {@link ZodError} If validation fails
   */
  toUpdateDTO(entity: unknown) {
    if (Object.entries(entity as Record<string, any>).length === 0) {
      throw new ApiError({
        statusCode: 400,
        path: "body",
        message: "Must update at least one field",
        errorCode: errorCode.badRequest,
      });
    }

    // Inject updatedAt with update timestamp
    const input = {
      ...(entity as Record<string, any>)
    }
    const { updatedAtField } = this.config.commonFields;
    if (updatedAtField) {
      input[updatedAtField] = new Date();
    }

    return this.parse(this.updateSchema, input);
  }


  /**
   * Converts a DTO to JSON format
   * @param dto - The DTO to convert
   * @returns JSON representation of the DTO
   */
  public toJSON(
    dto: Partial< // Partial dto of the entity
      z.infer<typeof this.config.baseSchema>
    >
  ): Partial<z.infer<typeof this.config.baseSchema>> {

    // NOTE: A toJSON object is used to create data representation
    // at user layer. Fields can be modified using toJSON. For
    // example, a database representation of a user record may
    // contain a password field which can be ommited using toJSON

    return dto;
  }

  /**
   * Parses and validates data against a Zod schema
   * @param schema - Zod schema to validate against
   * @param data - Data to validate
   * @returns Validated data
   * @throws {@link ZodError} If validation fails
   */
  protected parse<S extends z.ZodType>(
    schema: S, // Any type of zod schema against which a data will be validated
    data: any // The entity to be validated
  ): z.infer<S> {

    // NOTE: This is a wrapper for safeParse ensures consistent 
    // error format with ZodError class

    const { data: validatedData, success, error, } = schema.safeParse(data)

    // Throw error if validation fails
    if (!success) {
      throw new ZodError(error.issues)
    }
    return validatedData;
  }

  /**
   * Gets the create schema with auto-generated fields omitted
   */
  protected get createSchema(): ZodObject<ZodRawShape> {
    // TODO: We should include support for dynamic auto-generated
    // field omit for easy initiation and developer convinience.

    const config: DTOConfig = this.config;
    const { commonFields: {
      idField,
      createdAtField,
      updatedAtField,
      isDeletedField
    } } = config;

    const omitObject: Record<string, true> = {};

    // Including the objectes to be omitted
    if (idField) omitObject[idField] = true;
    if (createdAtField) omitObject[createdAtField] = true;
    if (updatedAtField) omitObject[updatedAtField] = true;
    if (isDeletedField) omitObject[isDeletedField] = true;

    return config.baseSchema.omit(omitObject);
  }

  /**
   * Gets the update schema with immutable fields omitted and all fields made partial
   */
  protected get updateSchema(): ZodObject<ZodRawShape> {
    // TODO: Same as createSchema, we should add support
    // for dynamic auto generated field omitting

    const config: DTOConfig = this.config;
    const { commonFields: {
      idField,
      createdAtField,
    } } = config;

    const omitObject: Record<string, true> = {};

    if (idField) omitObject[idField] = true;
    if (createdAtField) omitObject[createdAtField] = true;

    return config.baseSchema
      .partial()
      .omit(omitObject)
  }

}

/**
 * Configuration interface for Data Transfer Object (DTO)
 */
export interface DTOConfig {
  baseSchema: ZodObject<ZodRawShape>; // Base Zod schema for validation

  // This is used to omit auto generated fields
  commonFields: {
    idField: string;
    createdAtField?: string;
    updatedAtField?: string;
    isDeletedField?: string;
  }
}
