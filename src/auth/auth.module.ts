import { Module } from '@nestjs/common';
import { TokenModule } from 'src/token/token.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { VkModule } from 'src/vk/vk.module';
import { GoogleModule } from 'src/google/google.module';
import { FacebookModule } from 'src/facebook/facebook.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { TwitchModule } from 'src/twitch/twitch.module';

@Module({
	imports: [
		TokenModule,
		UserModule,
		MailerModule,
		VkModule,
		GoogleModule,
		FacebookModule,
		TelegramModule,
		TwitchModule,
	],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
