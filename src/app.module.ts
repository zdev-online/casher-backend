import { CacheModule, CacheStore, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';
import { redisStore } from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionsFilter, TransformInterceptor } from './common';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { WebsocketExceptionsFilter } from './common/filters/ws-exceptions.filter';
import { ProfileModule } from './profile/profile.module';
import { VkModule } from './vk/vk.module';
import { GoogleModule } from './google/google.module';
import { FacebookModule } from './facebook/facebook.module';
import { TelegramModule } from './telegram/telegram.module';
import { TwitchModule } from './twitch/twitch.module';
import { LinksModule } from './links/links.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: join(process.cwd(), 'configs', `.${process.env.NODE_ENV}.env`),
			encoding: 'utf-8',
		}),
		CacheModule.registerAsync({
			imports: [ConfigModule],
			isGlobal: true,
			useFactory: async (configService: ConfigService) => {
				const store = await redisStore({
					socket: {
						host: configService.getOrThrow('REDIS_HOST'),
						port: +configService.getOrThrow('REDIS_PORT'),
					},
				});
				return {
					store: store as unknown as CacheStore,
				};
			},
			inject: [ConfigService],
		}),
		TokenModule,
		AuthModule,
		UserModule,
		PrismaModule,
		MailerModule,
		ProfileModule,
		VkModule,
		GoogleModule,
		FacebookModule,
		TelegramModule,
		TwitchModule,
		LinksModule,
		NotificationsModule,
		ChatModule,
		UploadModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: HttpExceptionsFilter,
		},
		{
			provide: APP_FILTER,
			useClass: WebsocketExceptionsFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TransformInterceptor,
		},
	],
})
export class AppModule {}
