import { Prisma } from '@prisma/client';

export class UserCreateDto {
	public email?: string | null;
	public password?: string;
	public nickname?: string | null;
	public balance?: number;
	public vk_id?: number;
	public google_id?: string;
}
