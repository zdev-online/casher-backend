import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { UNKNOWN_ERROR_CODE } from '../constants';
import { BaseHttpException } from '../exceptions';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
	catch(exception: any, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();

		if (exception instanceof BaseHttpException) {
			return httpAdapter.reply(ctx.getResponse(), exception.serialize(), exception.getStatus());
		}

		if (exception instanceof HttpException) {
			const response = exception.getResponse() as any;
			const body = new BaseHttpException(
				typeof response == 'object'
					? { message: response?.message || 'Unknown error' }
					: { message: response },
				exception.getStatus(),
				UNKNOWN_ERROR_CODE,
			);

			if (!~exception.message.search(/Cannot [POST|GET|PUT|DELETE|OPTIONS]/gim)) {
				Logger.error(`${exception?.message}\n${exception?.stack}`, `HttpException`);
			}

			return httpAdapter.reply(ctx.getResponse(), body.serialize(), exception.getStatus());
		}
	}
}
