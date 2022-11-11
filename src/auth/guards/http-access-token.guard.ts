import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import e from 'express';
import { ACCESS_TOKEN_KEY, InvalidTokenException } from 'src/common';
import { TokenService } from 'src/token/token.service';

export class HttpAccessTokenGuard implements CanActivate {
	constructor(@Inject(TokenService) private tokenService: TokenService) {}

	public async canActivate(ctx: ExecutionContext) {
		const request: e.Request & { user: any } = ctx.switchToHttp().getRequest();
		const access_token: string = request.cookies?.[ACCESS_TOKEN_KEY];

		const payload = await this.tokenService.verifyAccessToken(access_token);
		if (!payload) {
			throw new InvalidTokenException('access');
		}

		request.user = payload;
		return true;
	}
}
