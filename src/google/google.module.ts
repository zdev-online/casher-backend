import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';

@Module({
	imports: [HttpModule.register({})],
	providers: [GoogleService],
	exports: [GoogleService],
})
export class GoogleModule {}
