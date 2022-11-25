import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { rename } from 'fs/promises';
import { join } from 'path';
import { Distionations } from 'src/common';

@Injectable()
export class UploadService {
	private uploads_dir = join(process.cwd(), 'uploads');

	constructor() {
		const uploads_dir_exists = existsSync(this.uploads_dir);
		if (!uploads_dir_exists) {
			mkdirSync(this.uploads_dir, { recursive: true });
		}

		const dir_keys = Object.keys(Distionations);

		for (let key of dir_keys) {
			const dir = join(this.uploads_dir, Distionations[key]);
			const is_dir_exists = existsSync(dir);
			if (!is_dir_exists) {
				mkdirSync(dir, { recursive: true });
			}
		}
	}

	/** Сохранить аватар */
	public async saveAvatar(file: Express.Multer.File) {
		const old_path = join(file.destination, file.filename);
		const new_path = join(this.uploads_dir, Distionations.AVATARS, file.filename);
		await rename(old_path, new_path);
		return file.filename;
	}
}
