import { IsNotEmpty, IsString } from 'class-validator';

export class VkAuthDto {
	@IsNotEmpty()
	@IsString()
	public code: string;
}
