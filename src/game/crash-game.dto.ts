import { Exclude, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class AddCrashBetDto {
	@IsNotEmpty()
	@IsNumber()
	public bet: number;

	@IsOptional()
	@IsNotEmpty()
	@IsNumber()
	public auto_output?: number | null;
}

export class CrashBet {
	public user_id: number;

	public bet: number;

	public auto_output?: number | null;

	constructor(data: CrashBet) {
		Object.assign(this, data);
	}
}

export class CrashGame {
	@Type(() => CrashBet)
	public bets: CrashBet[];

	@Exclude()
	public max_x: number;

	public start_at: number;

	public is_started: boolean;

	constructor(data: CrashGame) {
		Object.assign(this, data);
	}
}
