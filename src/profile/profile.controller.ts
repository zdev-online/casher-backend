import {
	Body,
	Controller,
	Get,
	Param,
	ParseFilePipeBuilder,
	Post,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { v4 } from 'uuid';
import { tmpdir } from 'os';
import { diskStorage } from 'multer';
import { HttpAccessTokenGuard } from 'src/auth/guards';
import { User } from 'src/common';
import { UserInRequest } from 'src/user/user.interface';
import { ChangeNicknameDto, ChangePasswordDto } from './dto';
import { ProfileService } from './profile.service';
import { extname } from 'path';

@UseGuards(HttpAccessTokenGuard)
@Controller('profile')
export class ProfileController {
	constructor(private profileService: ProfileService) {}

	@Get('/me')
	public getMe(@User() user: UserInRequest) {
		return this.profileService.getMe(user.id);
	}

	@Get('/:id')
	public getProfile(@User() user: UserInRequest, @Param('id') id: string) {
		if (user.id.toString() === id) {
			return this.profileService.getMe(user.id);
		}

		return this.profileService.getProfile(Number(id));
	}

	@Put('/change/nickname')
	public changeNickname(@Body() dto: ChangeNicknameDto, @User() user: UserInRequest) {
		return this.profileService.changeNickname(user, dto);
	}

	@Put('/change/password')
	public changePassword(@Body() dto: ChangePasswordDto, @User() user: UserInRequest) {
		return this.profileService.changePassword(user, dto);
	}

	@Post('/change/avatar')
	@UseInterceptors(
		FileInterceptor('avatar', {
			dest: tmpdir(),
			fileFilter: (req: Request, file, callback) => {
				return callback(null, true);
			},
			storage: diskStorage({
				filename: (req, file, callaback) => {
					return callaback(null, `${v4()}${extname(file.originalname)}`);
				},
			}),
			limits: {
				fileSize: 2_097_152,
			},
		}),
	)
	public changeAvatar(
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: /jpg|jpeg|png|webp/i,
				})
				.build(),
		)
		file: Express.Multer.File,
		@User() user: UserInRequest,
	) {
		return this.profileService.changeAvatar(user, file);
	}
}
