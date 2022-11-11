import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
	IGoogleGetTokenError,
	IGoogleGetTokenResponse,
	IGoogleProfileInfoError,
	IGoogleProfileInfoResponse,
} from './google.interface';

@Injectable()
export class GoogleService {
	private GOOGLE_TOKEN_URL = 'https://accounts.google.com/o/oauth2/token';
	private GOOGLE_USER_URL = 'https://www.googleapis.com/oauth2/v1/userinfo';

	private GOOGLE_CLIENT_ID: string;
	private GOOGLE_CLIENT_SECRET: string;
	private GOOGLE_REDIRECT_URI: string;

	constructor(private configService: ConfigService, private httpService: HttpService) {
		this.GOOGLE_CLIENT_ID = configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
		this.GOOGLE_CLIENT_SECRET = configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
		this.GOOGLE_REDIRECT_URI = configService.getOrThrow<string>('GOOGLE_REDIRECT_URI');
	}

	/** Полчить аккаунт пользователя */
	public async getUserInfo(
		access_token: string,
	): Promise<IGoogleProfileInfoResponse & IGoogleProfileInfoError> {
		const user_info_url = this.getUserInfoUrl(access_token);

		const response: AxiosResponse<IGoogleProfileInfoResponse & IGoogleProfileInfoError> =
			await firstValueFrom(
				this.httpService
					.get(user_info_url)
					.pipe(catchError((error: AxiosError) => [error.response as any])),
			);

		return response.data;
	}

	/** Получить токен для дальнейшего получения пользователя */
	public async getAccessToken(
		code: string,
	): Promise<IGoogleGetTokenResponse & IGoogleGetTokenError> {
		const access_token_url = this.getAccessTokenUrl(code);

		const response: AxiosResponse<IGoogleGetTokenResponse & IGoogleGetTokenError> =
			await firstValueFrom(
				this.httpService
					.post(access_token_url)
					.pipe(catchError((error: AxiosError) => [error.response as any])),
			);

		return response.data;
	}

	/** Получить адрес для получения токена доступа */
	private getAccessTokenUrl(code: string): string {
		const url = new URL(this.GOOGLE_TOKEN_URL);

		url.searchParams.append('client_id', this.GOOGLE_CLIENT_ID);
		url.searchParams.append('client_secret', this.GOOGLE_CLIENT_SECRET);
		url.searchParams.append('redirect_uri', this.GOOGLE_REDIRECT_URI);
		url.searchParams.append('grant_type', 'authorization_code');
		url.searchParams.append('code', code);

		return url.toString();
	}

	/** Получить адрес для получения аккаунта пользователя */
	private getUserInfoUrl(access_token: string) {
		const url = new URL(this.GOOGLE_USER_URL);

		url.searchParams.append('client_id', this.GOOGLE_CLIENT_ID);
		url.searchParams.append('client_secret', this.GOOGLE_CLIENT_SECRET);
		url.searchParams.append('redirect_uri', this.GOOGLE_REDIRECT_URI);
		url.searchParams.append('access_token', access_token);

		return url.toString();
	}
}
