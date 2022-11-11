import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LinkResponseDto } from './dto';

@Injectable()
export class LinksService {
	constructor(private configService: ConfigService) {}

	public getAllAuthLinks(): LinkResponseDto[] {
		return [
			this.getVkAuthLink(),
			this.getTwitchAuthLink(),
			this.getGoogleAuthLink(),
			this.getTwitchAuthLink(),
			this.getFacebookAuthLink(),
		];
	}

	private getVkAuthLink(): LinkResponseDto {
		const url = new URL('https://oauth.vk.com/authorize');

		url.searchParams.append('client_id', this.configService.get('VK_CLIENT_ID'));
		url.searchParams.append('redirect_uri', this.configService.get('VK_REDIRECT_URI'));

		return new LinkResponseDto({ url: url.toString(), type: 'vkontakte' });
	}

	private getGoogleAuthLink(): LinkResponseDto {
		const url = new URL('https://accounts.google.com/o/oauth2/auth');

		url.searchParams.append(
			'scope',
			'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
		);
		url.searchParams.append('redirect_uri', this.configService.get('GOOGLE_REDIRECT_URI'));
		url.searchParams.append('client_id', this.configService.get('GOOGLE_CLIENT_ID'));
		url.searchParams.append('response_type', 'code');

		return new LinkResponseDto({ url: url.toString(), type: 'google' });
	}

	private getFacebookAuthLink(): LinkResponseDto {
		const url = new URL('https://www.facebook.com/v15.0/dialog/oauth');

		url.searchParams.append('client_id', this.configService.get('FACEBOOK_CLIENT_ID'));
		url.searchParams.append('redirect_uri', this.configService.get('FACEBOOK_REDIRECT_URI'));

		return new LinkResponseDto({ url: url.toString(), type: 'facebook' });
	}

	private getTwitchAuthLink(): LinkResponseDto {
		const url = new URL('https://id.twitch.tv/oauth2/authorize');

		url.searchParams.append('response_type', 'code');
		url.searchParams.append('client_id', this.configService.get('TWITCH_CLIENT_ID'));
		url.searchParams.append('redirect_uri', this.configService.get('TWITCH_REDIRECT_URI'));

		return new LinkResponseDto({ url: url.toString(), type: 'twitch' });
	}
}
