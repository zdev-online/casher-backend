import { Injectable } from '@nestjs/common';
import { UserPasswordInvalidException } from 'src/common';
import { UserPublicDto } from 'src/user/dto';
import { UserInRequest } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';
import { ChangeNicknameDto, ChangePasswordDto } from './dto';

@Injectable()
export class ProfileService {
	constructor(private userService: UserService) {}

	/** Смена никнейма пользователя */
	public async changeNickname(user: UserInRequest, dto: ChangeNicknameDto) {
		const updated_user = await this.userService.update(user.id, { nickname: dto.nickname });

		return new UserPublicDto(updated_user);
	}

	/** Смена пароля пользователя */
	public async changePassword(user: UserInRequest, dto: ChangePasswordDto) {
		const user_data = await this.userService.findOneById(user.id);
		const is_valid_password = await this.userService.isValidPassword(
			dto.old_password,
			user_data.password,
		);

		if (!is_valid_password) {
			throw new UserPasswordInvalidException();
		}

		const password = await this.userService.hashPassword(dto.new_password);
		const updated_user = await this.userService.update(user.id, { password });

		return new UserPublicDto(updated_user);
	}
}
