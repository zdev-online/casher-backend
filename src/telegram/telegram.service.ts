import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';
import { ITelegramAuthData } from './telegram.interface';

@Injectable()
export class TelegramService {
	private SECRET_KEY: Buffer;

	constructor(private configService: ConfigService) {
		const bot_token = configService.getOrThrow('TELEGRAM_BOT_TOKEN');
		this.SECRET_KEY = createHash('sha256').update(bot_token).digest();
	}

	public isValidData(data: ITelegramAuthData): boolean {
		const { hash, ...data_for_check_string } = data;
		const data_check_string = this.getDataCheckString(data_for_check_string);
		const hmac = this.getHmac(data_check_string);
		return hmac === data.hash;
	}

	private getHmac(data_check_string: string): string {
		const hmac = createHmac('sha256', this.SECRET_KEY);
		hmac.update(data_check_string);
		return hmac.digest('hex').toLowerCase();
	}

	private getDataCheckString(data: Omit<ITelegramAuthData, 'hash'>): string {
		const keys = Object.keys(data).sort();
		return keys.map((key) => `${key}=${data[key]}`).join('\n');
	}
}
