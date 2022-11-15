import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { BaseWsException } from '../exceptions';
import { UNKNOWN_ERROR_CODE } from '../constants';

@Catch(WsException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const ws = host.switchToWs();
		const client = ws.getClient<Socket>();

		if (exception instanceof BaseWsException) {
			const response = exception.serialize();
			return client.emit(`exception`, { ...response, id: client.id });
		}

		if (exception instanceof WsException) {
			const response = exception.getError() as any;
			const body = new BaseWsException(
				typeof response == 'object'
					? { message: response?.message || 'Unknown error' }
					: { message: response },
				UNKNOWN_ERROR_CODE,
			);

			Logger.error(`${exception?.message}\n${exception?.stack}`, `WsException`);

			return client.emit(`exception`, { ...body.serialize(), id: client.id });
		}
	}
}
