import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, Match } from 'src/common';

export class ChangePasswordDto {
	@IsNotEmpty()
	@IsString()
	public old_password: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(MIN_PASSWORD_LENGTH)
	@MaxLength(MAX_PASSWORD_LENGTH)
	public new_password: string;

	@IsNotEmpty()
	@IsString()
	@Match('new_password')
	public new_password_confirm: string;
}
