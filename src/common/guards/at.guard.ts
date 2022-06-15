import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ATGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(contexct: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [contexct.getHandler(), contexct.getClass()]);
        // return true;

        if (isPublic) {
            return true;
        }

        return super.canActivate(contexct);
    }
}
