import {
  Controller,
  FileTypeValidator,
  Inject,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { STORAGE_SERVICE } from '../storage/storage.service.interface';
import type { StorageService } from '../storage/storage.service.interface';
import { UploadResponseDto } from './dto/upload-response.dto';

const ALLOWED_FOLDERS = ['categories', 'blog', 'banners', 'combos', 'popups'] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(@Inject(STORAGE_SERVICE) private readonly storageService: StorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload 1 ảnh dùng chung (danh mục/blog/banner)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', enum: ALLOWED_FOLDERS })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder: AllowedFolder = 'categories',
  ): Promise<UploadResponseDto> {
    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'categories';

    return this.storageService.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      folder: safeFolder,
    });
  }
}
