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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết' })
  create(@Body() dto: CreateBlogDto, @CurrentUser() user: AuthenticatedUser) {
    return this.blogsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết (phân trang/tìm kiếm/lọc/sắp xếp)' })
  findAll(@Query() query: QueryBlogDto) {
    return this.blogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết bài viết' })
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá bài viết' })
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
