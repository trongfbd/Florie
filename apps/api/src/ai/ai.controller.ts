import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { ChatMessageDto } from './dto/chat-message.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({ summary: 'Kiểm tra tính năng AI đã được cấu hình (có GEMINI_API_KEY) hay chưa' })
  getStatus() {
    return { configured: this.aiService.isConfigured };
  }

  @Post('generate-content')
  @ApiOperation({ summary: 'Sinh mô tả sản phẩm hoặc bài blog bằng AI' })
  generateContent(@Body() dto: GenerateContentDto) {
    return this.aiService.generateContent(dto);
  }

  @Post('sales-assistant')
  @ApiOperation({ summary: 'Trợ lý AI gợi ý sản phẩm phù hợp theo yêu cầu khách hàng' })
  salesAssistant(@Body() dto: ChatMessageDto) {
    return this.aiService.salesAssistant(dto);
  }

  @Post('dashboard-qa')
  @ApiOperation({ summary: 'Hỏi đáp bằng ngôn ngữ tự nhiên dựa trên dữ liệu kinh doanh thực tế' })
  dashboardQa(@Body() dto: ChatMessageDto) {
    return this.aiService.dashboardQa(dto);
  }

  @Get('inventory-insights')
  @ApiOperation({ summary: 'AI phân tích và cảnh báo tồn kho thông minh' })
  inventoryInsights() {
    return this.aiService.inventoryInsights();
  }
}
