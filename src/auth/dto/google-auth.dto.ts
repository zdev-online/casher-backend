import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
	@IsNotEmpty()
	@IsString()
	public code: string;
}
