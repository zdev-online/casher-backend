import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
	constructor(private prismaService: PrismaService) {}

	/** Получить непрочитанные уведомления */
	public getUnread(user_id: number) {
		return this.prismaService.notifications.findMany({
			where: {
				user_id,
				is_readed: false,
			},
		});
	}

	/** Добавить уведомления для пользователя */
	public create(data: Prisma.NotificationsCreateInput) {
		return this.prismaService.notifications.create({ data });
	}

	/** Пометить указанные увемедолмения, как прочитанные */
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
