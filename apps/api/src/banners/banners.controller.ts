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
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo banner' })
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách banner (phân trang/lọc/sắp xếp)' })
  findAll(@Query() query: QueryBannerDto) {
    return this.bannersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết banner' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật banner' })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá banner' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
