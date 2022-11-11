import { CacheKey, CacheTTL, Controller, Get } from '@nestjs/common';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
	constructor(private linkService: LinksService) {}

	@CacheKey('links_auth')
	@CacheTTL(10)
	@Get('/auth')
	async getAuthLinks() {
		return this.linkService.getAllAuthLinks();
	}
}
