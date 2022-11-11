import { IsNotEmpty, IsString } from 'class-validator';

export class FacebookAuthDto {
	@IsNotEmpty()
	@IsString()
	public code: string;
}
