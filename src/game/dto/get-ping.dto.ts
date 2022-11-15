import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class GetPingDto {
	@IsNotEmpty()
	@IsNumber({ allowInfinity: false, allowNaN: false })
	public time: number;
}
