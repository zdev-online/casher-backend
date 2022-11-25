import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UserModule } from 'src/user/user.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
	imports: [UserModule, UploadModule],
	providers: [ProfileService],
	controllers: [ProfileController],
})
export class ProfileModule {}
