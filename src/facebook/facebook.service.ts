import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
	IFacebookAccessTokenResponse,
	IFacebookError,
	IFacebookUserResponse,
} from './facebook.interface';

@Injectable()
export class FacebookService {
	private FACEBOOK_CLIENT_ID: string;
	private FACEBOOK_CLIENT_SECRET: string;
	private FACEBOOK_REDIRECT_URI: string;
	private FACEBOOK_TOKEN_URL: string = 'https://graph.facebook.com/oauth/access_token';
	private FACEBOOK_USER_URL: string = 'https://graph.facebook.com/me';

	constructor(private configService: ConfigService, private httpService: HttpService) {
		this.FACEBOOK_CLIENT_ID = configService.getOrThrow<string>('FACEBOOK_CLIENT_ID');
		this.FACEBOOK_CLIENT_SECRET = configService.getOrThrow<string>('FACEBOOK_CLIENT_SECRET');
		this.FACEBOOK_REDIRECT_URI = configService.getOrThrow<string>('FACEBOOK_REDIRECT_URI');
	}

	public async getAccessToken(
		code: string,
	): Promise<IFacebookAccessTokenResponse & IFacebookError> {
		const access_token_url = this.getAccessTokenUrl(code);
		const response: AxiosResponse<IFacebookAccessTokenResponse & IFacebookError> =
			await firstValueFrom(
				this.httpService
					.get(access_token_url)
					.pipe(catchError((error: AxiosError) => [error.response as any])),
			);

		return response.data;
	}

	public async getUserInfo(access_token: string): Promise<IFacebookUserResponse & IFacebookError> {
		const user_info_url = this.getUserInfoUrl(access_token);

		const response: AxiosResponse<IFacebookUserResponse & IFacebookError> = await firstValueFrom(
			this.httpService
				.get(user_info_url)
				.pipe(catchError((error: AxiosError) => [error.response as any])),
		);

		return response.data;
	}

	/** Поулчить ссылку для получения токена доступа  */
	private getAccessTokenUrl(code: string): string {
		const url = new URL(this.FACEBOOK_TOKEN_URL);

		url.searchParams.append('client_id', this.FACEBOOK_CLIENT_ID);
		url.searchParams.append('client_secret', this.FACEBOOK_CLIENT_SECRET);
		url.searchParams.append('redirect_uri', this.FACEBOOK_REDIRECT_URI);
		url.searchParams.append('code', code);

		return url.toString();
	}

	/** Получить ссылку для получения пользователя */
	private getUserInfoUrl(access_token: string): string {
		const url = new URL(this.FACEBOOK_USER_URL);

		url.searchParams.append('access_token', access_token);
		url.searchParams.append('fields', 'id,email,first_name,last_name');

		return url.toString();
	}
}
