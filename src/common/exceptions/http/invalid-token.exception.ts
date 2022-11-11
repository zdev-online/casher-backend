import { HttpStatus } from '@nestjs/common';
import {
	INVALID_ACCESS_TOKEN,
	INVALID_REFRESH_TOKEN,
	INVALID_VERIFICATION_TOKEN,
} from 'src/common/constants';
import { BaseHttpException } from './base-http.exception';

export class InvalidTokenException extends BaseHttpException {
	constructor(token_type: 'verification' | 'access' | 'refresh') {
		const code =
			token_type == 'access'
				? INVALID_ACCESS_TOKEN
				: token_type == 'refresh'
				? INVALID_REFRESH_TOKEN
				: INVALID_VERIFICATION_TOKEN;

		super(
			{ message: `invalid ${token_type} token` },
			token_type != 'verification' ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST,
			code,
		);
	}
}
