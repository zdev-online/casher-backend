import { Logger } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { Server, Socket } from 'socket.io';
import {
	ACCESS_TOKEN_KEY,
	BaseWsException,
	defaultGatewayOptions,
	NOT_AUTHORIZED_CODE,
	SocketEvents,
	SocketNamespaces,
} from 'src/common';
import { TokenService } from 'src/token/token.service';
import { GetNotificationsDto, MarkAsReadManyDto } from './dto';
import { INotificationsUser } from './notifications.interface';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
	...defaultGatewayOptions,
	namespace: SocketNamespaces.NOTIFICATIONS,
})
export class NotificationsGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	private logger: Logger = new Logger('NotificationsGateway');
	private users: Map<string, INotificationsUser> = new Map();

	@WebSocketServer()
	private server: Server;

	constructor(
		private tokenService: TokenService,
		private notificationService: NotificationsService,
	) {}

	/** Событие подключения клиента к серверу */
	public async handleConnection(client: Socket) {
		const { cookie } = client.request.headers;
		const access_token = parse(cookie || '')?.[ACCESS_TOKEN_KEY];
		const user = await this.tokenService.verifyAccessToken(access_token);
		if (user) {
			this.users.set(client.id, { id: user.id });
			const unread = await this.notificationService.getUnread(user.id, 10);
			client.emit(SocketEvents.NEW_NOTIFICATIONS, unread);
		}
	}

	@SubscribeMessage(SocketEvents.GET_UNREAD_NOTIFICATIONS)
	public async getNotifications(
		@ConnectedSocket() client: Socket,
		@MessageBody() dto: GetNotificationsDto,
	) {
		const user = this.users.get(client.id);
		if (!user) {
			throw new BaseWsException({ message: 'Not authorized' }, NOT_AUTHORIZED_CODE);
		}

		const unread = await this.notificationService.getUnread(user.id, dto.limit, dto.get_from);
		client.emit(SocketEvents.NEW_NOTIFICATIONS, unread);
	}

	@SubscribeMessage(SocketEvents.MARK_AS_READ_NOTIFICATIONS)
	public async markAsReadMany(@MessageBody() dto: MarkAsReadManyDto) {
		await this.notificationService.markAsReadMany(dto.ids);
	}

	/** Событие отключения клиента от сервера */
	public handleDisconnect(client: Socket) {
		this.users.has(client.id) && this.users.delete(client.id);
	}

	/** Событие запуска сервера */
	public afterInit() {
		this.logger.log(`Socket IO Server started.`);
	}
}
