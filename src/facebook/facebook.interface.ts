export interface IFacebookAccessTokenResponse {
	readonly access_token: string;
	readonly token_type: string;
	readonly expires_in: string;
	readonly id_token: string;
}

export interface IFacebookUserResponse {
	readonly id: string;
	readonly email: string;
	readonly first_name: string;
	readonly last_name: string;
}

export interface IFacebookError {
	readonly error: {
		readonly message: string;
	};
}
