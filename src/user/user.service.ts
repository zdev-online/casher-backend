import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	/**
	 * Найти пользователя по E-Mail
	 */
	public findOneByEmail(email: string) {
		return this.prismaService.user.findUnique({
			where: {
				email,
			},
		});
	}

	/** Создать пользователя */
	public create(data: Prisma.UserCreateInput) {
		return this.prismaService.user.create({ data });
	}

	/** Найти пользователя по ID */
	public findOneById(id: number) {
		return this.prismaService.user.findUnique({ where: { id } });
	}

	/** Найти пользователя по VK ID */
	public findOneByVkId(vk_id: number) {
		return this.prismaService.user.findFirst({ where: { vk_id } });
	}

	/** Найти пользователя по Google ID */
	public findOneByGoogleId(google_id: string) {
		return this.prismaService.user.findFirst({ where: { google_id } });
	}

	/** Найти пользователя по Facebook ID */
	public findOneByFacebookId(facebook_id: string) {
		return this.prismaService.user.findFirst({ where: { facebook_id } });
	}

	/** Найти пользователя по Telegram ID */
	public findOneByTelegramId(telegram_id: string) {
		return this.prismaService.user.findFirst({ where: { telegram_id } });
	}

	/** Найти пользователя по TwitchID */
	public findOneByTwitchId(twitch_id: string) {
		return this.prismaService.user.findFirst({ where: { twitch_id } });
	}

	/** Обновить данные пользователя */
	public update(id: number, data: Prisma.UserUpdateInput) {
		return this.prismaService.user.update({ data, where: { id } });
	}

	/** Захэшировать пароль пользователя */
	public async hashPassword(raw_password: string) {
		const salt = await bcrypt.genSalt();
		const hashed_password = await bcrypt.hash(raw_password, salt);
		return hashed_password;
	}

	/** Проверяет пароль пользователя на валидность */
	public isValidPassword(raw_password: string, user_password: string) {
		return bcrypt.compare(raw_password, user_password);
	}
}
