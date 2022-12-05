import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
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
import {
	BaseWsException,
	defaultGatewayOptions,
	FAIL_VALIDATION_CODE,
	SocketEvents,
	SocketNamespaces,
	WsResponseDto,
} from 'src/common';
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
	...defaultGatewayOptions,
})
// TODO: Сделать cron-job \ interval для игр
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	private logger: Logger = new Logger('GameGateway');

	@WebSocketServer()
	private server: Server;

	// TODO: Сделать interface для Crash игры
	private crash_game: any;

	@SubscribeMessage(SocketEvents.PING)
	public getPingInfo(@MessageBody() dto: GetPingDto): WsResponseDto<{ ping: number }> {
		return new WsResponseDto(SocketEvents.PING, {
			ping: Date.now() - dto.time,
		});
	}

	@SubscribeMessage(SocketEvents.GAME_CRASH_GET_CURRENT)
	async getCurrentCrashGame(@ConnectedSocket() client: Socket): Promise<WsResponse<any>> {
		return new WsResponseDto(SocketEvents.GAME_CRASH_GET_CURRENT, this.crash_game);
	}

	// TODO: Сделать dto ставки
	@SubscribeMessage(SocketEvents.GAME_CRASH_BET)
	async betForCrashGame(@MessageBody() bet: any, @ConnectedSocket() client: Socket) {}

	/** Событие подключения клиента к серверу */
	public handleConnection(client: Socket) {}

	/** Событие отключения клиента от сервера */
	public handleDisconnect(client: Socket) {}

	/** Событие запуска сервера */
	public afterInit() {
		this.logger.log(`Socket IO Server started.`);
	}
}
