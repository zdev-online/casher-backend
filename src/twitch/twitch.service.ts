import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
	ITwitchUserInfoResponse,
	ITwitchError,
	ITwitchAccessTokenResponse,
} from './twitch.interface';

@Injectable()
export class TwitchService {
	private TWITCH_CLIENT_ID: string;
	private TWITCH_CLIENT_SECRET: string;
	private TWITCH_REDIRECT_URI: string;
	private TWITCH_TOKEN_URL: string = 'https://id.twitch.tv/oauth2/token';
	private TWITCH_USER_URL: string = 'https://id.twitch.tv/oauth2/validate';

	constructor(private configService: ConfigService, private httpService: HttpService) {
		this.TWITCH_CLIENT_ID = configService.getOrThrow('TWITCH_CLIENT_ID');
		this.TWITCH_CLIENT_SECRET = configService.getOrThrow('TWITCH_CLIENT_SECRET');
		this.TWITCH_REDIRECT_URI = configService.getOrThrow('TWITCH_REDIRECT_URI');
	}

	/** Получить токен доступа  */
	public async getAccesstoken(code: string): Promise<ITwitchAccessTokenResponse & ITwitchError> {
		const access_token_url = this.getAccessTokenUrl(code);

		const response: AxiosResponse<ITwitchAccessTokenResponse & ITwitchError> = await firstValueFrom(
			this.httpService
				.post(access_token_url)
				.pipe(catchError((error: AxiosError) => [error.response as any])),
		);

		return response.data;
	}

	/** Получить данные пользователя */
	public async getUserInfo(access_token: string): Promise<ITwitchUserInfoResponse & ITwitchError> {
		const user_info_url = this.getUserInfoUrl();

		const response: AxiosResponse<ITwitchUserInfoResponse & ITwitchError> = await firstValueFrom(
			this.httpService
				.get(user_info_url, { headers: this.getValidateRequestHeaders(access_token) })
				.pipe(catchError((error: AxiosError) => [error.response as any])),
		);

		return response.data;
	}

	/** Получить ссылку для получения токена доступа  */
	private getAccessTokenUrl(code: string) {
		const url = new URL(this.TWITCH_TOKEN_URL);

		url.searchParams.append('client_id', this.TWITCH_CLIENT_ID);
		url.searchParams.append('client_secret', this.TWITCH_CLIENT_SECRET);
		url.searchParams.append('redirect_uri', this.TWITCH_REDIRECT_URI);
		url.searchParams.append('grant_type', 'authorization_code');
		url.searchParams.append('code', code);

		return url.toString();
	}

	/** Получить ссылку для получения пользователя */
	private getUserInfoUrl() {
		const url = new URL(this.TWITCH_USER_URL);

		return url.toString();
	}

	private getValidateRequestHeaders(access_token: string) {
		return {
			Authorization: `OAuth ${access_token}`,
		};
	}
}
