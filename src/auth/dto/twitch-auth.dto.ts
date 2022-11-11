import { IsNotEmpty, IsString } from 'class-validator';

export class TwitchAuthDto {
	@IsNotEmpty()
	@IsString()
	public code: string;
}
