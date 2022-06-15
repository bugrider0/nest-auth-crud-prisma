import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { hash, compare } from 'bcryptjs';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtServerice: JwtService) {}

    hashData(data: string) {
        return hash(data, 10);
    }

    async getTokens(userId: number, email: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtServerice.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: 'AccessTokenSecretExam',
                    expiresIn: '1d',
                },
            ),
            this.jwtServerice.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: 'RefreshTokenSecretExam',
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async updateRTHash(userId: number, rt: string) {
        const hash = await this.hashData(rt);
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashRT: hash,
            },
        });
    }

    async LocalSignUp(dto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (user) throw new ConflictException('User Excist');

        const hashedPassword = await this.hashData(dto.password);
        const newUser = await this.prisma.user.create({
            data: {
                email: dto.email,
                hash: hashedPassword,
            },
        });

        const tokens = await this.getTokens(newUser.id, newUser.email);
        await this.updateRTHash(newUser.id, tokens.refresh_token);

        return tokens;
    }

    async LocalSignIn(dto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user) throw new ForbiddenException('Access Denied');

        const passwordMatche = await compare(dto.password, user.hash);
        if (!passwordMatche) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRTHash(user.id, tokens.refresh_token);

        return tokens;
    }

    async signOut(userId: number) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashRT: {
                    not: null,
                },
            },
            data: {
                hashRT: null,
            },
        });
    }

    async refreshToken(userId: number, rt: string): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user || !user.hashRT) throw new ForbiddenException('Access Denied');

        const rtMathe = compare(rt, user.hashRT);
        if (!rtMathe) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRTHash(user.id, tokens.refresh_token);

        return tokens;
    }
}
