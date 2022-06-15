import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const currentUserDecorator = createParamDecorator((data: string | undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;

    return request.user[data];
});
