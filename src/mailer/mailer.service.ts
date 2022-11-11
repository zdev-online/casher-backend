import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { IVerificationOptions } from './mailer.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
	private frontend_name: string;
	private frontend_host: string;

	constructor(private nestMailer: NestMailerService, private configService: ConfigService) {
		this.frontend_name = this.configService.getOrThrow('FRONTEND_NAME');
		this.frontend_host = this.configService.getOrThrow('FRONTEND_HOST');
	}

	/**
	 * Отправляет письмо для подтверждения регистрации
	 */
	public async sendVerificationLink(options: IVerificationOptions) {
		await this.nestMailer
			.sendMail({
				subject: `Подтверждение регистрации на ${this.frontend_name}`,
				to: options.email,
				template: 'signup-confirm',
				context: {
					email_confirm_url: this.getEmailConfirmUrl(options.token),
				},
			})
			.catch((reason) =>
				Logger.error(`Cannot send verification mail: ${reason}`, 'MailerVerificationMail'),
			);
	}

	/**
	 * Получить ссылку подтверждения регистрации
	 */
	private getEmailConfirmUrl(token: string): string {
		const frontend_confirm_email_path = this.configService.get('FRONTEND_CONFIRM_EMAIL_PATH');

		const url = new URL(frontend_confirm_email_path, this.frontend_host);

		url.searchParams.append('token', token);

		return url.toString();
	}
}
