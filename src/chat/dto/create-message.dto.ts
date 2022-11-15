import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_CHAT_MESSAGE_LENGTH, MIN_CHAT_MESSAGE_LENGTH } from 'src/common';

export class CreateMessageDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(MIN_CHAT_MESSAGE_LENGTH)
	@MaxLength(MAX_CHAT_MESSAGE_LENGTH)
	public text: string;
}
