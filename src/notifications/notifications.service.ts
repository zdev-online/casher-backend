import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
	constructor(private prismaService: PrismaService) {}

	/** Получить непрочитанные уведомления */
	public async getUnread(user_id: number, limit: number, cursor_id?: number) {
		const messages = await this.prismaService.notifications.findMany({
			skip: cursor_id && 1,
			take: limit || 10,
			cursor: cursor_id
				? {
						id: cursor_id,
				  }
				: undefined,
			where: {
				user_id,
			},
		});

		/** Курсор для следующего запроса */
		const next_from: number | undefined = messages.at(-1)?.id;

		return { messages, next_from };
	}

	/** Добавить уведомления для пользователя */
	public create(data: Prisma.NotificationsCreateInput) {
		return this.prismaService.notifications.create({ data });
	}

	/** Пометить указанные уведомления, как прочитанные */
	public markAsReadMany(notification_ids: number[]) {
		return this.prismaService.notifications.updateMany({
			where: {
				OR: notification_ids.map((id) => ({ id })),
			},
			data: {
				is_readed: true,
			},
		});
	}
}
