import { describe, beforeEach, vi, Mocked, it, expect } from "vitest";
import { BaseDAO, BaseDTO, BaseService } from "@/base";
import { ApiError } from "@/utils";
import { errorCode } from "@/lib";
import z from "zod";

// Mock dependencies
vi.mock("../base/BaseDAO")
vi.mock("../base/BaseDTO")
vi.mock("../utils")
vi.mock("../lib")

class TestService extends BaseService { }

interface TEntity {
    id: string
    name: string
    email: string
}

describe("BaseService", () => {
    let mockDTO: Mocked<BaseDTO>;
    let mockDAO: Mocked<BaseDAO>;
    let testService: BaseService;
    let mockEntity: TEntity;
    let mockCreateData: Partial<TEntity>;
    let mockUpdateData: Partial<TEntity>;

    beforeEach(() => {
        vi.clearAllMocks()

        mockDTO = {
            config: {
                baseSchema: z.object({}),
                autoFields: {
                    idField: 'id',
                    createdAtField: 'createdAt',
                    updatedAtField: 'updatedAt',
                    isDeletedField: 'isDeleted'
                }
            },
            toCreateDTO: vi.fn(),
            toUpdateDTO: vi.fn(),
            toJSON: vi.fn()
        } as unknown as Mocked<BaseDTO>;

        mockDAO = {
            dto: mockDTO,
            insert: vi.fn(),
            findById: vi.fn(),
            findOne: vi.fn(),
            findAll: vi.fn(),
            delete: vi.fn(),
            restore: vi.fn()
        } as unknown as Mocked<BaseDAO>;

        mockEntity = {
            id: "test-id",
            name: "Test Entity",
            email: "test@email.com"
        }

        mockCreateData = {
            name: "Test Entity",
            email: "test@email.com"
        }

        mockUpdateData = {
            name: "Updated Entity"
        }

        testService = new TestService({ dao: mockDAO })
    })

    describe("constructor", () => {
        it("should initialize with provided dao and dto", () => {
            expect(testService.dao).toBe(mockDAO)
            expect(testService["dto"]).toBe(mockDTO)
        })
    })

    describe("create", () => {
        it("should create an entity and return formatted output", async () => {
            const validatedData = { ...mockCreateData };
            mockDTO.toCreateDTO.mockReturnValue(validatedData); // Mock DTO validation
            mockDAO.insert.mockResolvedValue(mockEntity as never); // Mock DAO operation

            const formattedOutput = { ...mockEntity, formatted: true };
            mockDTO.toJSON.mockReturnValue(formattedOutput); // Mock formatting

            const result = await testService.create(mockCreateData);

            expect(mockDTO.toCreateDTO).toHaveBeenCalledWith(mockCreateData);
            expect(mockDAO.insert).toHaveBeenCalledWith(validatedData);
            expect(mockDTO.toJSON).toHaveBeenCalledWith(mockEntity);
            expect(result).toEqual(formattedOutput);
        })

        it("should handle error during creation", async () => {
            const error = new Error("Creation Failed");
            mockDTO.toCreateDTO.mockImplementation(() => {
                throw error // mock rejected value
            })

            await expect(testService.create(mockCreateData)).rejects.toThrow(error)
        })
    })

    describe("findById", () => {
        it("should find an entity by id and return formatted output", async () => {
            mockDAO.findById.mockResolvedValue(mockEntity as never)

            const formattedOutput = { ...mockEntity, formatted: true };
            mockDTO.toJSON.mockReturnValue(formattedOutput)

            const result = await testService.findById(mockEntity.id)

            expect(mockDAO.findById).toHaveBeenCalledWith(mockEntity.id)
            expect(mockDTO.toJSON).toHaveBeenCalledWith(mockEntity)
            expect(result).toEqual(formattedOutput)
        })

        it("should throw ApiError if entity is not found", async () => {
            mockDAO.findById.mockResolvedValue(null)

            await expect(testService.findById("non-existent-id")).rejects.toThrow(ApiError)
        })

        it("should throw ApiError if attempted to retrieved soft-deleted record", async () => {
            const deletedEntity = { ...mockEntity, isDeleted: true };
            mockDAO.findById.mockResolvedValue(deletedEntity);

            await expect(testService.findById(deletedEntity.id)).rejects.toThrow(ApiError)
        })
    })

    describe("findAll", () => {
        it("should find all the entities", async () => {
            const entities = [mockEntity, { ...mockEntity, id: "test-id-2" }];
            mockDAO.findAll.mockResolvedValue(entities as never);

            const formattedOutput = entities.map(e => ({ ...e, formatted: true }));
            mockDTO.toJSON
                .mockReturnValueOnce(formattedOutput[0] as never)
                .mockReturnValueOnce(formattedOutput[1] as never)

            const result = await testService.findAll();

            expect(mockDAO.findAll).toHaveBeenCalled();
            expect(mockDTO.toJSON).toHaveBeenCalledTimes(2);
            expect(result).toEqual(formattedOutput);
        })

        it("should filter and find entities", async () => {
            const entities = [
                mockEntity,
                {
                    id: "test-id-2",
                    name: "Test 2",
                    email: "test2@entity.com"
                }
            ]
            const filter = { email: "test@email.com" }
            mockDAO.findAll.mockResolvedValue([mockEntity] as never)
            const formattedOutput = entities.map(e => ({ ...e, formatted: true }));
            mockDTO.toJSON.mockResolvedValueOnce(formattedOutput[0] as never)

            const result = await testService.findAll(filter)
            console.log(result)

            expect(mockDAO.findAll).toHaveBeenCalledWith(filter, undefined)
            expect(result).toEqual([mockEntity])
        })

        it("should return an empty array if no entities found", async () => {
            const emptyList: TEntity[] = [];
            mockDAO.findAll.mockResolvedValue(emptyList as never);

            const result = await testService.findAll();

            expect(mockDAO.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
            expect(mockDTO.toJSON).not.toHaveBeenCalled();
        })
    })
})
