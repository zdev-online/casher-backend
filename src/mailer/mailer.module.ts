import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerService } from './mailer.service';
import { join } from 'path';

@Module({
	imports: [
		NestMailerModule.forRootAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					transport: {
						host: configService.getOrThrow('MAILER_HOST'),
						auth: {
							user: configService.getOrThrow('MAILER_USER'),
							pass: configService.getOrThrow('MAILER_PASS'),
						},
					},
					defaults: {
						from: configService.getOrThrow('MAILER_USER'),
					},
					template: {
						dir: join(process.cwd(), 'templates'),
						adapter: new HandlebarsAdapter(),
						options: {
							strict: true,
						},
					},
				};
			},
			inject: [ConfigService],
		}),
	],
	providers: [MailerService],
	exports: [MailerService],
})
export class MailerModule {}
