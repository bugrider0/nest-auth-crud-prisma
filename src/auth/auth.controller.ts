import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { currentUserDecorator, Public } from 'src/common/decorators';

import { ATGuard, RTGuard } from 'src/common/guards';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('local/sign-up')
    @HttpCode(HttpStatus.CREATED)
    LocalSignUp(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.LocalSignUp(dto);
    }

    @Public()
    @Post('local/sign-in')
    @HttpCode(HttpStatus.OK)
    LocalSignIn(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.LocalSignIn(dto);
    }

    @UseGuards(ATGuard)
    @Post('sign-out')
    @HttpCode(HttpStatus.OK)
    signOut(@currentUserDecorator('sub') userId: number) {
        this.authService.signOut(userId);
    }

    @Public()
    @UseGuards(RTGuard)
    @Post('/refresh-token')
    @HttpCode(HttpStatus.OK)
    refreshToken(
        @currentUserDecorator('sub') userId: number,
        @currentUserDecorator('refreshToken') refreshToken: string,
    ): Promise<Tokens> {
        return this.authService.refreshToken(userId, refreshToken);
    }
}
