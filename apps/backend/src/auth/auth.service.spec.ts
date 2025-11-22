 
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/client';

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;
    let db: PrismaService;
    const mockEmail = 'test@example.com';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue('fake-jwt'),
                    },
                },
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        db = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signin()', () => {
        it('should return a token when credentials are valid', async () => {
            (db.user.findUnique.bind(db.user) as jest.Mock).mockResolvedValue({
                id: '1',
                email: mockEmail,
                password: '$2a$12$sMMo3i8VFnCF.EepYKNS8uu9kdS4gWFgwDVx7QgJtmztEYf/HA1xi',
            });

            const result = await service.signin({
                email: mockEmail,
                password: '123',
            });

            expect(db.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockEmail },
            });

            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: '1',
            });

            expect(result).toEqual({ token: 'fake-jwt' });
        });

        it('should throw an error when user is not found', async () => {
            (db.user.findUnique.bind(db.user) as jest.Mock).mockRejectedValue(
                new Prisma.PrismaClientKnownRequestError('Known request error', {
                    code: 'P2025',
                    clientVersion: '5.0.0',
                }),
            );

            await expect(service.signin({ email: mockEmail, password: '123' })).rejects.toThrow(
                NotFoundException,
            );

            expect(db.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockEmail },
            });
            expect(jwtService.signAsync).toHaveBeenCalledTimes(0);
        });

        it('should throw an error when password is incorrect', async () => {
            (db.user.findUnique.bind(db.user) as jest.Mock).mockResolvedValue({
                id: '1',
                email: mockEmail,
                password: '$2a$12$sMMo3i8VFnCF.EepYKNS8uu9kdS4gWFgwDVx7QgJtmztEYf/HA1xi',
            });

            await expect(
                service.signin({
                    email: mockEmail,
                    password: '1234',
                }),
            ).rejects.toThrow(BadRequestException);

            expect(db.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockEmail },
            });
            expect(jwtService.signAsync).toHaveBeenCalledTimes(0);
        });

        it('should throw an error if PrismaClientUnknownRequestError occurs', async () => {
            (db.user.findUnique.bind(db.user) as jest.Mock).mockRejectedValue(
                new Prisma.PrismaClientUnknownRequestError('Unknown request error', {
                    clientVersion: '5.0.0',
                }),
            );

            await expect(service.signin({ email: mockEmail, password: '123' })).rejects.toThrow(
                InternalServerErrorException,
            );
            expect(db.user.findUnique).toHaveBeenCalledWith({
                where: { email: mockEmail },
            });
            expect(jwtService.signAsync).toHaveBeenCalledTimes(0);
        });
    });
});
