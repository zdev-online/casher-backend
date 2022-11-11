import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
	UserAlreadyExistsException,
	UserNotFoundException,
	UserPasswordInvalidException,
	InvalidTokenException,
	BaseHttpException,
	FAIL_VALIDATION_CODE,
} from 'src/common';
import { FacebookService } from 'src/facebook/facebook.service';
import { GoogleService } from 'src/google/google.service';
import { MailerService } from 'src/mailer/mailer.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { IAccessTokenPayload, IRefreshTokenPayload, ITokenInfo } from 'src/token/token.interface';
import { TokenService } from 'src/token/token.service';
import { TwitchService } from 'src/twitch/twitch.service';
import { UserPublicDto } from 'src/user/dto';
import { UserService } from 'src/user/user.service';
import { VkService } from 'src/vk/vk.service';
import {
	FacebookAuthDto,
	GoogleAuthDto,
	SignInWithEmailDto,
	SignUpWithEmailDto,
	TelegramAuthDto,
	TwitchAuthDto,
	VkAuthDto,
} from './dto';

@Injectable()
export class AuthService {
	constructor(
		private tokenService: TokenService,
		private userService: UserService,
		private mailerService: MailerService,
		private vkService: VkService,
		private googleService: GoogleService,
		private facebookService: FacebookService,
		private telegramService: TelegramService,
		private twitchService: TwitchService,
	) {}

	/** Регистрация пользователя через E-Mail*/
	public async signUpWithEmail(dto: SignUpWithEmailDto) {
		const { email, password } = dto;
		const isUserExists = await this.userService.findOneByEmail(email);
		if (isUserExists) {
			throw new UserAlreadyExistsException();
		}

		const hashed_password = await this.userService.hashPassword(password);
		const new_user = await this.userService.create({ email, password: hashed_password });

		const verification = await this.tokenService.getVerification({ id: new_user.id });
		this.mailerService.sendVerificationLink({ email, token: verification.token });

		const [access_token, refresh_token] = await this.regenerateTokens({ id: new_user.id });

		Logger.log(`Новый пользовать зарегистрован: ${new_user.email}`, 'NewUser');

		return { user: new UserPublicDto(new_user), access_token, refresh_token };
	}

	/** Вход пользователя через E-Mail*/
	public async signInWithEmail(dto: SignInWithEmailDto) {
		const { email, password } = dto;
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			throw new UserNotFoundException();
		}

		const is_valid_password = await this.userService.isValidPassword(password, user.password);
		if (!is_valid_password) {
			throw new UserPasswordInvalidException();
		}

		const [access_token, refresh_token] = await this.regenerateTokens({ id: user.id });

		return { user: new UserPublicDto(user), access_token, refresh_token };
	}

	/**  Авторизация через VK */
	public async vkontakteAuth(dto: VkAuthDto) {
		const vk_info = await this.vkService.getUserIdByCode(dto.code);
		if (vk_info.error) {
			throw new BaseHttpException(
				{ message: vk_info.error, description: vk_info.error_description },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const { user_id: vk_id } = vk_info;
		const user = await this.userService.findOneByVkId(vk_id);

		if (!user) {
			const new_user = await this.userService.create({ vk_id });
			const [access_token, refresh_token] = await this.regenerateTokens({ id: new_user.id });

			return {
				user: new UserPublicDto(new_user),
				access_token,
				refresh_token,
			};
		}

		const [access_token, refresh_token] = await this.regenerateTokens({ id: user.id });

		return {
			user: new UserPublicDto(user),
			access_token,
			refresh_token,
		};
	}

	/** Авторизация через Google */
	public async googleAuth(dto: GoogleAuthDto) {
		const google_info = await this.googleService.getAccessToken(dto.code);
		if (google_info.error) {
			throw new BaseHttpException(
				{ message: google_info.error, description: google_info.error_description },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const google_profile = await this.googleService.getUserInfo(google_info.access_token);
		if (google_profile.error) {
			throw new BaseHttpException(
				{ message: google_profile.error.message },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const user = await this.userService.findOneByGoogleId(google_profile.id);

		if (!user) {
			const new_user = await this.userService.create({
				google_id: google_profile.id,
				email: google_profile.email,
			});
			const [access_token, refresh_token] = await this.regenerateTokens({ id: new_user.id });

			return {
				user: new UserPublicDto(new_user),
				access_token,
				refresh_token,
			};
		}

		const [access_token, refresh_token] = await this.regenerateTokens({ id: user.id });

		return {
			user: new UserPublicDto(user),
			access_token,
			refresh_token,
		};
	}

	/** Авторизация через Facebook */
	public async facebookAuth(dto: FacebookAuthDto) {
		const facebook_info = await this.facebookService.getAccessToken(dto.code);
		if (facebook_info.error) {
			throw new BaseHttpException(
				{ message: facebook_info.error.message },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const facebook_profile = await this.facebookService.getUserInfo(facebook_info.access_token);
		if (facebook_profile.error) {
			throw new BaseHttpException(
				{ message: facebook_profile.error.message },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const user = await this.userService.findOneByFacebookId(facebook_profile.id);
		if (!user) {
			const new_user = await this.userService.create({ facebook_id: facebook_profile.id });

			const [access_token, refresh_token] = await this.regenerateTokens({ id: new_user.id });

			return {
				user: new UserPublicDto(new_user),
				access_token,
				refresh_token,
			};
		}

		const [access_token, refresh_token] = await this.regenerateTokens({ id: user.id });

		return {
			user: new UserPublicDto(user),
			access_token,
			refresh_token,
		};
	}

	/** Авторизация через Telegram */
	public async telegramAuth(dto: TelegramAuthDto) {
		const is_valid_data = this.telegramService.isValidData(dto);
		if (!is_valid_data) {
			throw new BaseHttpException(
				{ message: `Invalid auth data` },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const user = await this.userService.findOneByTelegramId(dto.id.toString());
		if (!user) {
			const new_user = await this.userService.create({ telegram_id: dto.id.toString() });

			const [access_token, refresh_token] = await this.regenerateTokens({ id: new_user.id });

			return {
				user: new UserPublicDto(new_user),
				access_token,
				refresh_token,
			};
		}

		const [access_token, refresh_token] = await this.regenerateTokens({ id: user.id });

		return {
			user: new UserPublicDto(user),
			access_token,
			refresh_token,
		};
	}

	/** Авторизация через Twitch */
	public async twitchAuth(dto: TwitchAuthDto) {
		const twitch_info = await this.twitchService.getAccesstoken(dto.code);
		if (twitch_info.message) {
			throw new BaseHttpException(
				{ message: twitch_info.message },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const twitch_profile = await this.twitchService.getUserInfo(twitch_info.access_token);
		if (twitch_profile.message) {
			throw new BaseHttpException(
				{ message: twitch_profile.message },
				HttpStatus.BAD_REQUEST,
				FAIL_VALIDATION_CODE,
			);
		}

		const user = await this.userService.findOneByTwitchId(twitch_profile.user_id);
		if (!user) {
			const new_user = await this.userService.create({ twitch_id: twitch_profile.user_id });
			const [access_token, refresh_token] = await this.regenerateTokens({ id: new_user.id });

			return {
				user: new UserPublicDto(new_user),
				access_token,
				refresh_token,
			};
		}

		const [access_token, refresh_token] = await this.regenerateTokens({ id: user.id });

		return {
			user: new UserPublicDto(user),
			access_token,
			refresh_token,
		};
	}

	/** Сгенерировать новую пару токенов*/
	public async refresh(token: string) {
		const payload = await this.tokenService.verifyRefreshToken(token);
		if (!payload) {
			throw new InvalidTokenException('refresh');
		}

		const user = await this.userService.findOneById(payload.id);
		if (!user) {
			throw new UserNotFoundException();
		}

		const [access_token, refresh_token] = await this.regenerateTokens({
			id: user.id,
		});

		return { access_token, refresh_token };
	}

	/** Генерация новой пары токенов */
	private async regenerateTokens(
		payload: IAccessTokenPayload & IRefreshTokenPayload,
	): Promise<[ITokenInfo, ITokenInfo]> {
		return Promise.all([
			this.tokenService.getAccess(payload),
			this.tokenService.getRefresh({ id: payload.id }),
		]);
	}
}
