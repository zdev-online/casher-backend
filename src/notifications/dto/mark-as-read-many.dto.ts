import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class MarkAsReadManyDto {
	@IsNotEmpty()
	@IsArray()
	@ArrayMinSize(1)
	@IsNumber({ allowInfinity: false, allowNaN: false }, { each: true })
	public ids: number[];
}
