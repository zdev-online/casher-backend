import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BaseWsException, FAIL_VALIDATION_CODE, SocketEvents, SocketNamespaces } from 'src/common';
import { WebsocketExceptionsFilter } from 'src/common/filters/ws-exceptions.filter';
import { GetPingDto } from './dto';

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
	namespace: SocketNamespaces.GAMES,
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	private logger: Logger = new Logger('GameGateway');

	@WebSocketServer()
	private server: Server;

	@SubscribeMessage(SocketEvents.PING)
	public getPingInfo(@MessageBody() dto: GetPingDto): WsResponse {
		return {
			event: SocketEvents.PING,
			data: {
				ping: Date.now() - dto.time,
			},
		};
	}

	/** Событие подключения клиента к серверу */
	public handleConnection(client: Socket) {}

	/** Событие отключения клиента от сервера */
	public handleDisconnect(client: Socket) {}

	/** Событие запуска сервера */
	public afterInit() {
		this.logger.log(`Socket IO Server started.`);
	}
}
