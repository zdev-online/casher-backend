export interface IVkAuthError {
	readonly error?: string;
	readonly error_description?: string;
}

export interface IVkAuthTokenData {
	readonly access_token: string;
	readonly user_id: number;
	readonly expires_in: number;
}
