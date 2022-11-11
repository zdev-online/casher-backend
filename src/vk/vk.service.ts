import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { IVkAuthError, IVkAuthTokenData } from './vk.interface';

@Injectable()
export class VkService {
	private VK_CLIENT_ID: string;
	private VK_CLIENT_SECRET: string;
	private VK_REDIRECT_URI: string;
	private VK_BASE_URL = 'https://oauth.vk.com/';

	constructor(private configService: ConfigService, private httpService: HttpService) {
		this.VK_CLIENT_ID = configService.getOrThrow<string>('VK_CLIENT_ID');
		this.VK_CLIENT_SECRET = configService.getOrThrow<string>('VK_CLIENT_SECRET');
		this.VK_REDIRECT_URI = configService.getOrThrow<string>('VK_REDIRECT_URI');
	}

	public async getUserIdByCode(code: string) {
		const access_token_url = this.getAccessTokenUrl(code);
		const response: AxiosResponse<IVkAuthTokenData & IVkAuthError> = await firstValueFrom(
			this.httpService
				.get(access_token_url)
				.pipe<AxiosResponse>(catchError((error: AxiosError) => [error.response as any])),
		);
		return response.data;
	}

	private getAccessTokenUrl(code: string): string {
		const url = new URL('/access_token', this.VK_BASE_URL);

		url.searchParams.append('client_id', this.VK_CLIENT_ID);
		url.searchParams.append('client_secret', this.VK_CLIENT_SECRET);
		url.searchParams.append('redirect_uri', this.VK_REDIRECT_URI);
		url.searchParams.append('code', code);

		return url.toString();
	}
}
