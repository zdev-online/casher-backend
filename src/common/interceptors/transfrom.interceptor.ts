import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpStatus,
} from '@nestjs/common';
import e from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
	response: T;
	status: HttpStatus;
	timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
		const context_type = context.getType();
		if (context_type == 'http') {
			return next.handle().pipe(
				map((response_data) => {
					const response: e.Response = context.switchToHttp().getResponse();

					return {
						response: response_data,
						status: response.statusCode,
						timestamp: new Date().toISOString(),
					};
				}),
			);
		} else if (context_type == 'ws') {
			return next.handle();
		}
	}
}
