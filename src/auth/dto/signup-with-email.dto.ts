import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Match, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from 'src/common';

/**
 * Класс валидации данных регистрации через E-Mail
 */
export class SignUpWithEmailDto {
	@IsNotEmpty()
	@IsEmail()
	public email: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(MIN_PASSWORD_LENGTH)
	@MaxLength(MAX_PASSWORD_LENGTH)
	public password: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(MIN_PASSWORD_LENGTH)
	@MaxLength(MAX_PASSWORD_LENGTH)
	@Match('password')
	public confirm_password: string;
}
