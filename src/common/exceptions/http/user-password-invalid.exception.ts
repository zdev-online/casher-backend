import { HttpStatus } from '@nestjs/common';
import { USER_PASSWORD_INVALID } from 'src/common/constants';
import { BaseHttpException } from './base-http.exception';

export class UserPasswordInvalidException extends BaseHttpException {
	constructor() {
		super({ message: 'invalid user password' }, HttpStatus.BAD_REQUEST, USER_PASSWORD_INVALID);
	}
}
