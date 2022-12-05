export class WsResponseDto<T> {
	constructor(public event: string, public data: T) {}
}
