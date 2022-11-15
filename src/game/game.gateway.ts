import { Logger } from '@nestjs/common';
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
import { WsEvents } from 'src/common';
import { GetPingDto } from './dto';

@WebSocketGateway({
	path: '/socket',
	namespace: '/games',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	private logger: Logger = new Logger('GameGateway');

	@WebSocketServer()
	private server: Server;

	@SubscribeMessage(WsEvents.PING)
	public getPingInfo(@MessageBody() dto: GetPingDto): WsResponse {
		return {
			event: WsEvents.PING,
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
