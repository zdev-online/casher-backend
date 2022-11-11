import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VkService } from './vk.service';

@Module({
	imports: [HttpModule.register({})],
	providers: [VkService],
	exports: [VkService],
})
export class VkModule {}
