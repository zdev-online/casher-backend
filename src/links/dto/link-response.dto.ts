export class LinkResponseDto {
	public type: string;
	public url: string;

	constructor(link: LinkResponseDto) {
		Object.assign(this, link);
	}
}
