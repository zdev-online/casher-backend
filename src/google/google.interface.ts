export interface IGoogleProfileInfoResponse {
	readonly id: string;
	readonly email: string;
	readonly name: string;
}

export interface IGoogleProfileInfoError {
	readonly error?: {
		readonly code: number;
		readonly message: string;
		readonly status: string;
	};
}

export interface IGoogleGetTokenResponse {
	readonly access_token: string;
	readonly token_type: string;
	readonly expires_in: number;
	readonly id_token: string;
}

export interface IGoogleGetTokenError {
	readonly error?: string;
	readonly error_description?: string;
}
