import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { BackupsService } from './backups.service';
import { RestoreBackupDto } from './dto/restore-backup.dto';

@ApiTags('backups')
@Controller('backups')
@Roles(UserRole.ADMIN)
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get('download')
  @ApiOperation({
    summary: 'Tải file sao lưu toàn bộ CSDL (pg_dump), chỉ ADMIN',
  })
  download(@Res() res: Response): void {
    this.backupsService.streamDump(res);
  }

  @Post('restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Khôi phục CSDL từ file sao lưu .sql — GHI ĐÈ toàn bộ dữ liệu hiện tại, chỉ ADMIN, yêu cầu xác nhận',
  })
  @UseInterceptors(FileInterceptor('file'))
  async restore(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Body() dto: RestoreBackupDto,
  ): Promise<void> {
    if (!file.originalname.toLowerCase().endsWith('.sql')) {
      throw new BadRequestException('Chỉ chấp nhận file .sql');
    }

    await this.backupsService.restoreFromSql(file.buffer);
    void dto;
  }
}
