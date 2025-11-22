 
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/client';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { hash } from 'bcrypt';

describe('UsersService', () => {
    let service: UsersService;
    let db: PrismaService;

    const mockPassword = '123456';
    const mockHashedPassword = '$2b$10$fakehashedpassword';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        db = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser()', () => {
        it('should create a user successfully', async () => {
            (db.user.create as jest.Mock).mockResolvedValue({
                id: '1',
                email: 'test@example.com',
                password: mockHashedPassword,
            });

            const result = await service.createUser({
                email: 'test@example.com',
                password: mockPassword,
            });

            expect(hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(db.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    password: mockHashedPassword,
                },
            });
            expect(result).toEqual({
                id: '1',
                email: 'test@example.com',
                password: mockHashedPassword,
            });
        });

        it('should throw BadRequestException if email already exists', async () => {
            (db.user.create as jest.Mock).mockRejectedValue(
                new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                    code: 'P2002',
                    clientVersion: '5.0.0',
                }),
            );

            await expect(
                service.createUser({
                    email: 'test@example.com',
                    password: mockPassword,
                }),
            ).rejects.toThrow(BadRequestException);

            expect(hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(db.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    password: mockHashedPassword,
                },
            });
        });

        it('should throw the error if it is another Prisma error', async () => {
            (db.user.create as jest.Mock).mockRejectedValue(
                new Prisma.PrismaClientKnownRequestError('Other error', {
                    code: 'P9999',
                    clientVersion: '5.0.0',
                }),
            );

            await expect(
                service.createUser({
                    email: 'test@example.com',
                    password: mockPassword,
                }),
            ).rejects.toThrow(InternalServerErrorException);

            expect(hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(db.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    password: mockHashedPassword,
                },
            });
        });
    });
});
