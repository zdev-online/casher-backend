import { WsException } from '@nestjs/websockets';
import { IErrorObject } from 'src/common/interfaces';

export class BaseWsException extends WsException {
	constructor(object: IErrorObject | IErrorObject[], private code: number) {
		super(object);
	}

	public serialize() {
		const response = this.getError();

		if (Array.isArray(response)) {
			return {
				code: this.getCode(),
				errors: response,
				timestamp: new Date().toISOString(),
			};
		}

		return {
			code: this.getCode(),
			error: response,
			timestamp: new Date().toISOString(),
		};
	}

	private getCode() {
		return this.code;
	}
}
