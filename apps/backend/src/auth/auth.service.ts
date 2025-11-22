import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly db: PrismaService,
    ) {}

    async signin(signinDto: SigninDto) {}
}
