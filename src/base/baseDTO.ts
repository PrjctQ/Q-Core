import z, { AnyZodObject, ZodError } from "zod/v3";
import { ApiError } from "../utils";
import { errorCode } from "../lib";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DTOConfig {
  baseSchema: AnyZodObject;
  commonFields: {
    idField: string;
    createdAtField?: string;
    updatedAtField?: string;
    isDeletedField?: string;
  }
}

export abstract class BaseDTO {
  private config: DTOConfig;

  constructor(config: DTOConfig) {
    this.config = config;
  }

  toCreateDTO(entity: unknown) {
    return this.parse(this.createSchema, entity);
  }

  // // In your DTO class
  // toUpdateDTO(entity: unknown) {
  //   // Empty object check
  //   if (Object.entries(entity as Record<string, any>).length === 0) {
  //     throw new ApiError({
  //       statusCode: 400,
  //       path: "body",
  //       message: "Must update at least one field",
  //       errorCode: errorCode.badRequest,
  //     });
  //   }
  //
  //   // Inject updatedAt
  //   const input = {
  //     ...(entity as Record<string, any>),
  //     ...(this.config.commonFields.updatedAtField && {
  //       [this.config.commonFields.updatedAtField]: new Date()
  //     })
  //   };
  //
  //   // Create deep partial schema if not already cached
  //   if (!this._partialUpdateSchema) {
  //     this._partialUpdateSchema = this.createDeepPartialSchema(this.updateSchema);
  //   }
  //
  //   return this.parse(this._partialUpdateSchema, input);
  // }
  //
  // // Helper to recursively make schema partial
  // private createDeepPartialSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  //   if (schema instanceof z.ZodObject) {
  //     const shape = schema.shape;
  //     const partialShape: Record<string, z.ZodTypeAny> = {};
  //
  //     for (const key in shape) {
  //       partialShape[key] = this.createDeepPartialSchema(shape[key]);
  //     }
  //
  //     return z.object(partialShape).partial();
  //   }
  //
  //   if (schema instanceof z.ZodArray) {
  //     return z.array(this.createDeepPartialSchema(schema.element)).optional();
  //   }
  //
  //   if (schema instanceof z.ZodUnion) {
  //     return z.union(
  //       schema.options.map((opt: any) => this.createDeepPartialSchema(opt))
  //     ).optional();
  //   }
  //
  //   if (schema instanceof z.ZodIntersection) {
  //     return z.intersection(
  //       this.createDeepPartialSchema(schema._def.left),
  //       this.createDeepPartialSchema(schema._def.right)
  //     ).optional();
  //   }
  //
  //   return schema.optional();
  // }
  //
  // // Cache the partial schema
  // private _partialUpdateSchema?: z.ZodTypeAny;

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

  public toJSON(
    dto: Partial<z.infer<typeof this.config.baseSchema>>
  ): Partial<z.infer<typeof this.config.baseSchema>> {
    return dto;
  }

  // protected get getConfig(): DTOConfig {
  //     const config = (this as any).config;
  //     if (!config) {
  //         throw new Error(`Must define a static config`)
  //     }
  //     return config;
  // }

  protected parse<S extends z.ZodType>(schema: S, data: any): z.infer<S> {
    const { data: validatedData, success, error } = schema.safeParse(data)
    if (!success) {
      throw new ZodError(error.errors)
    }
    return validatedData;
  }

  // ZodTypeAny depricated
  protected get createSchema(): any {
    const config: DTOConfig = this.config;
    const { commonFields: {
      idField,
      createdAtField,
      updatedAtField,
      isDeletedField
    } } = config;

    const omitObject: Record<string, true> = {};

    if (idField) omitObject[idField] = true;
    if (createdAtField) omitObject[createdAtField] = true;
    if (updatedAtField) omitObject[updatedAtField] = true;
    if (isDeletedField) omitObject[isDeletedField] = true;

    return config.baseSchema.omit(omitObject);
  }

  // ZodTypeAny depricated
  protected get updateSchema(): any {
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
