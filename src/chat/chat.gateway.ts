import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
	BaseWsException,
	defaultGatewayOptions,
	FAIL_VALIDATION_CODE,
	SocketEvents,
	SocketNamespaces,
} from 'src/common';
import { WebsocketExceptionsFilter } from 'src/common/filters/ws-exceptions.filter';
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
	private logger: Logger = new Logger('GameGateway');

	@WebSocketServer()
	private server: Server;

	private users: Map<string, number> = new Map();

	constructor(private chatService: ChatService) {}

	// TODO: Заменить id: 0 на id пользователя.
	@SubscribeMessage(SocketEvents.CHAT_MESSAGE)
	public onMessage(@MessageBody() dto: CreateMessageDto) {
		return this.chatService.createMessage({
			text: dto.text,
			from: {
				connect: {
					id: 0
				}
			}
		});
	}

	// FIXME: Проверить метод, кажется тут что-то не то написал
	@SubscribeMessage(SocketEvents.CHAT_GET_MESSAGES)
	public getMessages(@MessageBody() dto: GetMessagesDto) {
		return this.chatService.getMessages(dto.limit, dto.get_from);
	}

	/** Событие подключения клиента к серверу */
	public handleConnection(client: Socket) {
		this.users.set(client.id, 0);
	}

	/** Событие отключения клиента от сервера */
	public handleDisconnect(client: Socket) {
		this.users.has(client.id) && this.users.delete(client.id);
	}

	/** Событие запуска сервера */
	public afterInit() {
		this.logger.log(`[${ChatGateway.name}] Socket IO Server started.`);
	}
}
