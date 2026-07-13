import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PopupsService } from './popups.service';
import { CreatePopupDto } from './dto/create-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { QueryPopupDto } from './dto/query-popup.dto';

@ApiTags('popups')
@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo popup' })
  create(@Body() dto: CreatePopupDto) {
    return this.popupsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách popup (phân trang/lọc)' })
  findAll(@Query() query: QueryPopupDto) {
    return this.popupsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết popup' })
  findOne(@Param('id') id: string) {
    return this.popupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật popup' })
  update(@Param('id') id: string, @Body() dto: UpdatePopupDto) {
    return this.popupsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá popup' })
  remove(@Param('id') id: string) {
    return this.popupsService.remove(id);
  }
}
