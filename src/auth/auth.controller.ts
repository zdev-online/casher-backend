import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import e from 'express';
import { ACCESS_TOKEN_KEY, Cookies, REFRESH_TOKEN_KEY } from 'src/common';
import { ITokenInfo } from 'src/token/token.interface';
import { AuthService } from './auth.service';
import {
	FacebookAuthDto,
	GoogleAuthDto,
	SignInWithEmailDto,
	SignUpWithEmailDto,
	TelegramAuthDto,
	TwitchAuthDto,
	VkAuthDto,
} from './dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('/signup/email')
	public async signUpWithEmail(
		@Body() dto: SignUpWithEmailDto,
		@Res({ passthrough: true }) res: e.Response,
	) {
		const { user, access_token, refresh_token } = await this.authService.signUpWithEmail(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@HttpCode(HttpStatus.OK)
	@Post('/signin/email')
	public async signInWithEmail(
		@Body() dto: SignInWithEmailDto,
		@Res({ passthrough: true }) res: e.Response,
	) {
		const { user, access_token, refresh_token } = await this.authService.signInWithEmail(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@Post('/vkontakte')
	public async vkontakteAuth(@Body() dto: VkAuthDto, @Res({ passthrough: true }) res: e.Response) {
		const { user, access_token, refresh_token } = await this.authService.vkontakteAuth(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@Post('/google')
	public async googleAuth(@Body() dto: GoogleAuthDto, @Res({ passthrough: true }) res: e.Response) {
		const { user, refresh_token, access_token } = await this.authService.googleAuth(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@Post('/facebook')
	public async facebookAuth(
		@Body() dto: FacebookAuthDto,
		@Res({ passthrough: true }) res: e.Response,
	) {
		const { user, access_token, refresh_token } = await this.authService.facebookAuth(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@Post('/telegram')
	public async telegramAuth(
		@Body() dto: TelegramAuthDto,
		@Res({ passthrough: true }) res: e.Response,
	) {
		const { user, access_token, refresh_token } = await this.authService.telegramAuth(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@Post('/twitch')
	public async twitchAuth(@Body() dto: TwitchAuthDto, @Res({ passthrough: true }) res: e.Response) {
		const { user, access_token, refresh_token } = await this.authService.twitchAuth(dto);

		this.setTokensCookie(access_token, refresh_token, res);

		return user;
	}

	@HttpCode(HttpStatus.OK)
	@Post('/refresh')
	public async refresh(
		@Res({ passthrough: true }) res: e.Response,
		@Cookies(REFRESH_TOKEN_KEY) user_refresh_token?: string | undefined,
	) {
		const { access_token, refresh_token } = await this.authService.refresh(user_refresh_token);

		this.setTokensCookie(access_token, refresh_token, res);

		return;
	}

	@HttpCode(HttpStatus.OK)
	@Post('/logout')
	public async logout(@Res({ passthrough: true }) res: e.Response) {
		return this.clearTokensCookie(res);
	}

	/** Установить токены авторизации и обновления в cookie */
	private setTokensCookie(
		access_token: ITokenInfo,
		refresh_token: ITokenInfo,
		res: e.Response,
	): e.Response {
		res.cookie(ACCESS_TOKEN_KEY, access_token.token, {
			maxAge: access_token.ttl_ms,
			path: '/',
			httpOnly: true,
		});
		res.cookie(REFRESH_TOKEN_KEY, refresh_token.token, {
			maxAge: refresh_token.ttl_ms,
			path: '/auth/refresh',
			httpOnly: true,
		});

		return res;
	}

	/** Удалить токены из cookie */
	private clearTokensCookie(res: e.Response) {
		res.clearCookie(ACCESS_TOKEN_KEY, {
			path: '/',
			httpOnly: true,
		});
		res.clearCookie(REFRESH_TOKEN_KEY, {
			path: '/auth/refresh',
			httpOnly: true,
		});
	}
}
