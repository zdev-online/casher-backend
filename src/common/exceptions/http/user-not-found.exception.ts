import { HttpStatus } from '@nestjs/common';
import { USER_NOT_FOUND_CODE } from 'src/common/constants';
import { BaseHttpException } from './base-http.exception';

export class UserNotFoundException extends BaseHttpException {
	constructor() {
		super({ message: 'user not found' }, HttpStatus.BAD_REQUEST, USER_NOT_FOUND_CODE);
	}
}
