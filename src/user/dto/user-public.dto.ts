import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserPublicDto {
	@Exclude()
	public password: string;

	constructor(user: User) {
		Object.assign(this, user);
	}
}
