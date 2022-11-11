import { HttpStatus } from '@nestjs/common';
import { USER_ALREADY_EXISTS_CODE } from 'src/common/constants';
import { BaseHttpException } from './base-http.exception';

export class UserAlreadyExistsException extends BaseHttpException {
	constructor() {
		super({ message: 'user already exists' }, HttpStatus.BAD_REQUEST, USER_ALREADY_EXISTS_CODE);
	}
}
