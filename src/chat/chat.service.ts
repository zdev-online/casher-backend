import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
	constructor(private prismaService: PrismaService) {}

	/** Добавить сообщение в базу данных */
	public createMessage(data: Prisma.MessagesCreateInput) {
		return this.prismaService.messages.create({
			data,
			include: {
				from: {
					select: { nickname: true, id: true },
				},
			},
		});
	}

	/** Получить сообщения из базы */
	public async getMessages(limit: number, cursor_id?: number | undefined) {
		const messages = await this.prismaService.messages.findMany({
			skip: cursor_id && 1,
			take: limit || 10,
			cursor: cursor_id
				? {
						id: cursor_id,
				  }
				: undefined,
			include: {
				from: {
					select: {
						nickname: true,
						id: true,
					},
				},
			},
		});

		/** Курсор для следующего запроса */
		const next_from: number | undefined = messages.at(-1)?.id;

		return { messages, next_from };
	}
}
