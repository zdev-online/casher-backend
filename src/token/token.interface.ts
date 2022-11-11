export interface IAccessTokenPayload {
	readonly id: number;
}

export interface IRefreshTokenPayload {
	readonly id: number;
}

export interface IVerificationTokenPayload {
	readonly id: number;
}

export interface ITokenInfo {
	readonly token: string;
	readonly ttl_ms: number;
}
