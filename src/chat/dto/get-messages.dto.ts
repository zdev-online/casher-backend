import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetMessagesDto {
	@IsNotEmpty()
	@IsNumber({ allowInfinity: false, allowNaN: false })
	@IsInt()
	public limit: number;

	@IsOptional()
	@IsNotEmpty()
	@IsNumber({ allowInfinity: false, allowNaN: false })
	@IsInt()
	public get_from?: number | undefined;
}
