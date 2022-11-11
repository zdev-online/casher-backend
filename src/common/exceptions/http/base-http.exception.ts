import { HttpException, HttpStatus } from '@nestjs/common';
import { IErrorObject } from 'src/common/interfaces';

export class BaseHttpException extends HttpException {
	constructor(
		object: IErrorObject | IErrorObject[],
		http_status_code: HttpStatus,
		private code: number,
	) {
		super(object, http_status_code);
	}

	public getCode(): number {
		return this.code;
	}

	public serialize() {
		const response = this.getResponse();

		if (Array.isArray(response)) {
			return {
				code: this.getCode(),
				status: this.getStatus(),
				errors: response,
				timestamp: new Date().toISOString(),
			};
		}

		return {
			code: this.getCode(),
			status: this.getStatus(),
			error: response,
			timestamp: new Date().toISOString(),
		};
	}
}
