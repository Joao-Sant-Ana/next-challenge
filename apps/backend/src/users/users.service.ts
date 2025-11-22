import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
    constructor(private readonly db: PrismaService) {}

    async createUser(createUserDto: CreateUserDto) {}
}
