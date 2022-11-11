import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TelegramAuthDto {
	@IsNotEmpty()
	@IsNumber()
	readonly id: number;

	@IsNotEmpty()
	@IsString()
	readonly first_name: string;

	@IsNotEmpty()
	@IsString()
	readonly username: string;

	@IsNotEmpty()
	@IsString()
	readonly photo_url: string;

	@IsNotEmpty()
	@IsNumber()
	readonly auth_date: number;

	@IsNotEmpty()
	@IsString()
	readonly hash: string;
}
