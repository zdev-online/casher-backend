import { IsNotEmpty, IsNumber, IsInt, IsOptional } from "class-validator";

export class GetNotificationsDto {
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
