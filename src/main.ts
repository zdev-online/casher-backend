import { HttpStatus, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { FAIL_VALIDATION_CODE } from './common/constants/error-codes.constants';
import { BaseHttpException } from './common/exceptions/http/base-http.exception';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(helmet());
	app.use(cookieParser());

	const reflector = app.get(Reflector);
	app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector, { strategy: 'exposeAll' }));

	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (errors) => {
				const response = errors.map((error) => ({
					value: error.value,
					property: error.property,
					message: 'Invalid property value',
					constraints: error.constraints,
				}));
				return new BaseHttpException(response, HttpStatus.BAD_REQUEST, FAIL_VALIDATION_CODE);
			},
		}),
	);

	await app.listen(3000);
}
bootstrap();
