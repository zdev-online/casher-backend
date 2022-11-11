import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { HttpAccessTokenGuard } from 'src/auth/guards';
import { User } from 'src/common';
import { UserInRequest } from 'src/user/user.interface';
import { ChangeNicknameDto, ChangePasswordDto } from './dto';
import { ProfileService } from './profile.service';

@UseGuards(HttpAccessTokenGuard)
@Controller('profile')
export class ProfileController {
	constructor(private profileService: ProfileService) {}

	// TODO: Сделать метод getMe, дописать функционал
	@Get('/me')
	public getMe(@User() user: UserInRequest) {}

	// TODO: Сделать метод getProfile, дописать функционал
	@Get('/:id')
	public getProfile(@User() user: UserInRequest, @Param('id') id: string) {
		if (user.id.toString() === id) {
			// Тут вызываем метод ProfileService.getMe, т.к это его профиль
		}

		// Тут вызываем getProfile, т.к профиль чужой
	}

	@Put('/change/nickname')
	public changeNickname(@Body() dto: ChangeNicknameDto, @User() user: UserInRequest) {
		return this.profileService.changeNickname(user, dto);
	}

	@Put('/change/password')
	public changePassword(@Body() dto: ChangePasswordDto, @User() user: UserInRequest) {
		return this.profileService.changePassword(user, dto);
	}
}
