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
import { parse } from 'cookie';
import { Server, Socket } from 'socket.io';
import {
	ACCESS_TOKEN_KEY,
	BaseWsException,
	CRASH_GAME_IS_STARTED_CODE,
	defaultGatewayOptions,
	FAIL_VALIDATION_CODE,
	HIGH_BET_VALUE_CODE,
	LOW_BET_VALUE_CODE,
	NOT_AUTHORIZED_CODE,
	SocketEvents,
	SocketNamespaces,
	WsResponseDto,
} from 'src/common';
import { WebsocketExceptionsFilter } from 'src/common';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { AddCrashBetDto, CrashBet, CrashGame } from './crash-game.dto';
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
		forbidUnknownValues: true,
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

	private crash_game: CrashGame;

	private users = new Array<{ sid: string; uid: number }>();

	constructor(private tokenService: TokenService, private userService: UserService) {
		this.crashGameLoop();
	}

	@SubscribeMessage(SocketEvents.PING)
	public getPingInfo(@MessageBody() dto: GetPingDto): WsResponseDto<{ ping: number }> {
		return new WsResponseDto(SocketEvents.PING, {
			ping: Date.now() - dto.time,
		});
	}

	@SubscribeMessage(SocketEvents.GAME_CRASH_CURRENT)
	public async getCurrentCrashGame(@ConnectedSocket() client: Socket): Promise<WsResponse<any>> {
		return new WsResponseDto(SocketEvents.GAME_CRASH_CURRENT, this.crash_game);
	}

	@SubscribeMessage(SocketEvents.GAME_CRASH_BET)
	public async betForCrashGame(
		@MessageBody() bet: AddCrashBetDto,
		@ConnectedSocket() client: Socket,
	) {
		if (!this.isAuthed(client.id)) {
			throw new BaseWsException({ message: 'Not authorized' }, NOT_AUTHORIZED_CODE);
		}
		if (this.crash_game.is_started) {
			throw new BaseWsException({ message: 'Crash game is started' }, CRASH_GAME_IS_STARTED_CODE);
		}
		if (bet.auto_output < 1) {
			throw new BaseWsException(
				{ message: 'Automatic output cannot be lower than 1' },
				FAIL_VALIDATION_CODE,
			);
		}
		if (bet.bet < 0) {
			throw new BaseWsException({ message: 'Bet cannot be lower than 0' }, LOW_BET_VALUE_CODE);
		}
		const { uid } = this.users.find((user) => user.sid == client.id);
		const user = await this.userService.findOneById(uid);
		if (user.balance < bet.bet) {
			throw new BaseWsException(
				{ message: 'The bet cannot be more than your balance' },
				HIGH_BET_VALUE_CODE,
			);
		}

		this.crash_game.bets.push({ ...bet, user_id: user.id });

		return new WsResponseDto(SocketEvents.GAME_CRASH_BET, this.crash_game);
	}

	/** Цикл игры Crash */
	public async crashGameLoop() {
		const { max_x, start_at } = this.crash_game;
		try {
			if (!this.crash_game) {
				this.crash_game = new CrashGame({
					bets: [],
					is_started: false,
					start_at: Date.now() + 10 * 1000,
					max_x: Math.floor(Math.random() * 100),
				});
				return;
			}
			if (start_at > Date.now()) {
				this.crash_game.is_started = true;
				return this.server.sockets.emit(SocketEvents.GAME_CRASH_CURRENT, {
					...this.crash_game,
					max_x: undefined,
				});
			}

			for (let x = 0; x < max_x; x += 0.005) {
				// Проходимся по ставкам
				for (let bet of this.crash_game.bets) {
					// Если автовывод совпадает с X - выводим
					if (x == bet.auto_output) {
						await this.userService
							.update(bet.user_id, {
								balance: {
									increment: x * bet.bet,
								},
							})
							.catch((error) => this.logger.error(`Cannot add bet to balance: ${error}`));
						this.logger.log(`Пользователь #${bet.user_id} - выйграл: ${x * bet.bet}`, 'CrashGame');
					}
				}

				this.server.sockets.emit(SocketEvents.GAME_CRASH_CURRENT_X, {
					...this.crash_game,
					max_x: undefined,
					current_x: x,
				});
			}

			this.server.sockets.emit(SocketEvents.GAME_CRASH_END, this.crash_game);
			this.crash_game = undefined;
		} catch (error) {
		} finally {
			return this.crashGameLoop();
		}
	}

	/** Событие подключения клиента к серверу */
	public async handleConnection(client: Socket) {
		const { cookie } = client.request.headers;
		const access_token = parse(cookie || '')?.[ACCESS_TOKEN_KEY];
		const user = await this.tokenService.verifyAccessToken(access_token);
		if (user) {
			this.users.push({ sid: client.id, uid: user.id });
		}
		throw new BaseWsException({ message: 'Not authorized' }, NOT_AUTHORIZED_CODE);
	}

	private isAuthed(sid: string): boolean {
		return !!this.users.find((user) => user.sid == sid);
	}

	/** Событие отключения клиента от сервера */
	public handleDisconnect(client: Socket) {
		const index = this.users.findIndex((user) => user.sid == client.id);
		if (index != -1) {
			this.users.splice(index, 1);
		}
	}

	/** Событие запуска сервера */
	public afterInit() {
		this.logger.log(`Socket IO Server started.`);
	}
}
