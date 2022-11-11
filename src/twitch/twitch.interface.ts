export interface ITwitchUserInfoResponse {
	readonly client_id: string;
	readonly login: string;
	readonly scopes: string[];
	readonly user_id: string;
}

export interface ITwitchAccessTokenResponse {
	readonly access_token: string;
	readonly expires_in: number;
	readonly refresh_token: string;
	readonly scope: string[];
	readonly token_type: string;
}

export interface ITwitchError {
	readonly message: string;
	readonly status: number;
}
