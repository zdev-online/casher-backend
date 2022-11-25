import { Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { Server, Socket } from 'socket.io';
import {
	ACCESS_TOKEN_KEY,
	BaseWsException,
	CREATE_MESSAGE_RATE_LIMIT_MS,
	defaultGatewayOptions,
	FAIL_VALIDATION_CODE,
	FLOOD_LIMIT_CODE,
	NOT_AUTHORIZED_CODE,
	SocketEvents,
	SocketNamespaces,
} from 'src/common';
import { WebsocketExceptionsFilter } from 'src/common/filters/ws-exceptions.filter';
import { TokenService } from 'src/token/token.service';
import { IChatUser } from './chat.interface';
import { ChatService } from './chat.service';
import { CreateMessageDto, GetMessagesDto } from './dto';

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(
	new ValidationPipe({
		exceptionFactory: (errors) => {
			const response = errors.map((error) => ({
				value: error.value,
				property: error.property,
				message: 'Invalid property value',
				constraints: error.constraints,
			}));
			return new BaseWsException(response, FAIL_VALIDATION_CODE);
		},
	}),
)
@WebSocketGateway({
	...defaultGatewayOptions,
	namespace: SocketNamespaces.CHAT,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	private logger: Logger = new Logger('ChatGateway');

	@WebSocketServer()
	private server: Server;

	private users: Map<string, IChatUser> = new Map();

	constructor(private chatService: ChatService, private tokenService: TokenService) {}

	@SubscribeMessage(SocketEvents.CHAT_MESSAGE)
	public async onMessage(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket) {
		if (!this.users.has(client.id)) {
			throw new BaseWsException({ message: 'Not authorized' }, NOT_AUTHORIZED_CODE);
		}

		const user = this.users.get(client.id);
		if (Date.now() - user.last_messsage_at <= CREATE_MESSAGE_RATE_LIMIT_MS) {
			throw new BaseWsException(
				{
					message: `You can't write messages more often than once every ${CREATE_MESSAGE_RATE_LIMIT_MS} ms`,
				},
				FLOOD_LIMIT_CODE,
			);
		}

		const new_message = await this.chatService.createMessage({
			text: dto.text,
			from: {
				connect: {
					id: user.id,
				},
			},
		});

		client.broadcast.emit(SocketEvents.NEW_CHAT_MESSAGE, new_message);
		user.last_messsage_at = Date.now();

		return new_message;
	}

	@SubscribeMessage(SocketEvents.CHAT_GET_MESSAGES)
	public getMessages(@MessageBody() dto: GetMessagesDto) {
		return this.chatService.getMessages(dto.limit, dto.get_from);
	}

	/** Событие подключения клиента к серверу */
	public async handleConnection(client: Socket) {
		const { cookie } = client.request.headers;
		const access_token = parse(cookie || '')?.[ACCESS_TOKEN_KEY];
		const user = await this.tokenService.verifyAccessToken(access_token);
		user && this.users.set(client.id, { id: user.id, last_messsage_at: 0 });
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
