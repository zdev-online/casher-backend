import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInWithEmailDto {
	@IsNotEmpty()
	@IsEmail()
	public email: string;

	@IsNotEmpty()
	@IsString()
	public password: string;
}
