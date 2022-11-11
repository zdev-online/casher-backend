import { INVALID_ACCESS_TOKEN } from 'src/common/constants';
import { BaseWsException } from './base-ws.exception';

export class WsInvalidTokenException extends BaseWsException {
	constructor() {
		super({ message: `invalid access token` }, INVALID_ACCESS_TOKEN);
	}
}
