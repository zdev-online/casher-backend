import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
	IAccessTokenPayload,
	IRefreshTokenPayload,
	ITokenInfo,
	IVerificationTokenPayload,
} from './token.interface';

@Injectable()
export class TokenService {
	private access_token_secret: string;
	private refresh_token_secret: string;
	private verification_token_secret: string;

	private access_token_ttl_in_ms: number;
	private refresh_token_ttl_in_ms: number;
	private verification_token_ttl_in_ms: number;

	constructor(private configService: ConfigService, private jwtService: JwtService) {
		this.access_token_secret = configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET');
		this.refresh_token_secret = configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET');
		this.verification_token_secret = configService.getOrThrow('JWT_VERIFICATION_TOKEN_SECRET');

		this.access_token_ttl_in_ms = Number(configService.getOrThrow('JWT_ACCESS_TOKEN_TTL_IN_MS'));
		this.refresh_token_ttl_in_ms = Number(configService.getOrThrow('JWT_REFRESH_TOKEN_TTL_IN_MS'));
		this.verification_token_ttl_in_ms = Number(
			configService.getOrThrow('JWT_VERIFICATION_TOKEN_TTL_IN_MS'),
		);
	}

	/**
	 * Генерация access-токена
	 */
	public async getAccess(payload: IAccessTokenPayload): Promise<ITokenInfo> {
		const token = await this.jwtService.signAsync(payload, {
			secret: this.access_token_secret,
			expiresIn: this.getExpiresInFromConfirValue(this.access_token_ttl_in_ms),
		});

		return {
			token,
			ttl_ms: this.access_token_ttl_in_ms,
		};
	}

	/**
	 * Генерация refresh-токена
	 */
	public async getRefresh(payload: IRefreshTokenPayload): Promise<ITokenInfo> {
		const token = await this.jwtService.signAsync(payload, {
			secret: this.refresh_token_secret,
			expiresIn: this.getExpiresInFromConfirValue(this.refresh_token_ttl_in_ms),
		});

		return {
			token,
			ttl_ms: this.refresh_token_ttl_in_ms,
		};
	}

	/**
	 * Генерация токена подтверждения регистрации
	 */
	public async getVerification(payload: IVerificationTokenPayload): Promise<ITokenInfo> {
		const token = await this.jwtService.sign(payload, {
			secret: this.verification_token_secret,
			expiresIn: this.getExpiresInFromConfirValue(this.verification_token_ttl_in_ms),
		});

		return {
			token,
			ttl_ms: this.verification_token_ttl_in_ms,
		};
	}

	/**
	 * Проверка access-токена на валидность
	 */
	public async verifyAccessToken(access_token: string): Promise<IAccessTokenPayload | void> {
		try {
			const payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(access_token, {
				secret: this.access_token_secret,
			});
			return payload;
		} catch {
			return;
		}
	}

	/**
	 * Проверка refresh-токена на валидность
	 */
	public async verifyRefreshToken(refresh_token: string): Promise<IRefreshTokenPayload | void> {
		try {
			const payload = await this.jwtService.verifyAsync<IRefreshTokenPayload>(refresh_token, {
				secret: this.refresh_token_secret,
			});
			return payload;
		} catch {
			return;
		}
	}

	/**
	 * Проверка токена подтверждения регистрации
	 */
	public veifyVerificationToken(
		verification_token: string,
	): Promise<IVerificationTokenPayload | void> {
		try {
			return this.jwtService.verifyAsync<IVerificationTokenPayload>(verification_token, {
				secret: this.verification_token_secret,
			});
		} catch {
			return;
		}
	}

	/**
	 * Получить значение для срока годности токена (jwtService.sign)
	 */
	private getExpiresInFromConfirValue(value: number): number {
		return value / 1000;
	}
}
