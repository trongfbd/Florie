import { Injectable } from '@nestjs/common';
import { MaterialsService } from '../materials/materials.service';
import { ProductsService } from '../products/products.service';
import { QueryPublicProductDto } from '../products/dto/query-public-product.dto';
import { ReportsService } from '../reports/reports.service';
import { GeminiService } from './gemini.service';
import { GenerateContentDto, GenerateContentType } from './dto/generate-content.dto';
import { ChatMessageDto } from './dto/chat-message.dto';

const SYSTEM_PREAMBLE =
  'Bạn là trợ lý AI nội bộ cho Bèo Flower Corner, một tiệm hoa tươi tại Việt Nam. Luôn trả lời bằng tiếng Việt, ngắn gọn, tự nhiên, đúng trọng tâm.';

@Injectable()
export class AiService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly productsService: ProductsService,
    private readonly reportsService: ReportsService,
    private readonly materialsService: MaterialsService,
  ) {}

  get isConfigured(): boolean {
    return this.gemini.isConfigured;
  }

  async generateContent(dto: GenerateContentDto): Promise<{ content: string }> {
    const keywordsLine = dto.keywords ? `\nTừ khoá cần nhấn mạnh: ${dto.keywords}` : '';

    const prompt =
      dto.contentType === GenerateContentType.PRODUCT_DESCRIPTION
        ? `${SYSTEM_PREAMBLE}\n\nViết mô tả sản phẩm hoa cho: "${dto.topic}".${keywordsLine}\nYêu cầu: 2-4 câu, gợi cảm xúc, phù hợp đăng lên website bán hàng, không dùng markdown, không thêm tiêu đề.`
        : `${SYSTEM_PREAMBLE}\n\nViết một bài blog ngắn (250-400 từ) về chủ đề: "${dto.topic}".${keywordsLine}\nYêu cầu: định dạng Markdown với 2-3 tiêu đề phụ (##), giọng văn thân thiện, hữu ích, phù hợp blog của tiệm hoa. Không cần tiêu đề chính (H1) vì trang web đã hiển thị riêng.`;

    const content = await this.gemini.generate(prompt);
    return { content: content.trim() };
  }

  async salesAssistant(dto: ChatMessageDto): Promise<{ reply: string }> {
    const query = new QueryPublicProductDto();
    query.limit = 50;
    const products = await this.productsService.findPublicList(query);
    const catalogLines = products.data
      .map((p) => `- ${p.name} | ${p.salePrice ?? p.basePrice}đ | ${p.category.name} | màu: ${p.color ?? 'đa dạng'}`)
      .join('\n');

    const prompt = `${SYSTEM_PREAMBLE} Bạn đang giúp nhân viên bán hàng tư vấn cho khách.

Danh sách sản phẩm đang bán (CHỈ được gợi ý từ danh sách này, không bịa sản phẩm không có):
${catalogLines}

Yêu cầu/câu hỏi từ nhân viên: "${dto.message}"

Hãy gợi ý 1-3 sản phẩm phù hợp nhất kèm lý do ngắn gọn, hoặc trả lời câu hỏi nếu không phải yêu cầu gợi ý sản phẩm.`;

    const reply = await this.gemini.generate(prompt);
    return { reply: reply.trim() };
  }

  async dashboardQa(dto: ChatMessageDto): Promise<{ reply: string }> {
    const [summary, expenses, topProducts] = await Promise.all([
      this.reportsService.getSummary({}),
      this.reportsService.getExpensesByCategory({}),
      this.reportsService.getTopProducts({ limit: 5 }),
    ]);

    const dataContext = `Dữ liệu kinh doanh 30 ngày gần nhất (từ ${summary.from} đến ${summary.to}):
- Doanh thu: ${summary.revenue}đ từ ${summary.completedOrderCount} đơn hoàn thành (tổng ${summary.orderCount} đơn, ${summary.cancelledOrderCount} đơn huỷ)
- Giá trị đơn trung bình: ${summary.avgOrderValue}đ
- Tổng chi phí: ${summary.totalExpenses}đ, lợi nhuận ước tính: ${summary.netProfit}đ
- Khách hàng mới: ${summary.newCustomerCount}
- Chi phí theo hạng mục: ${expenses.byCategory.map((c) => `${c.category} ${c.total}đ`).join(', ') || 'chưa có'}
- Sản phẩm bán chạy: ${topProducts.map((p) => `${p.name} (${p.quantitySold} sp, ${p.revenue}đ)`).join(', ') || 'chưa có dữ liệu'}`;

    const prompt = `${SYSTEM_PREAMBLE} Bạn đang trả lời câu hỏi của chủ shop dựa trên dữ liệu kinh doanh thực tế bên dưới. CHỈ dùng số liệu đã cho, không tự bịa số liệu khác.

${dataContext}

Câu hỏi: "${dto.message}"`;

    const reply = await this.gemini.generate(prompt);
    return { reply: reply.trim() };
  }

  async inventoryInsights(): Promise<{ summary: string; lowStockCount: number }> {
    const lowStock = await this.materialsService.findLowStock();

    if (lowStock.length === 0) {
      return { summary: 'Hiện tất cả vật tư đều đủ mức tồn kho an toàn — không có cảnh báo nào.', lowStockCount: 0 };
    }

    const lines = lowStock
      .map((m) => `- ${m.name}: còn ${m.stockQuantity} ${m.unit}, ngưỡng cảnh báo ${m.minStockThreshold} ${m.unit}`)
      .join('\n');

    const prompt = `${SYSTEM_PREAMBLE} Đây là danh sách vật tư đang dưới ngưỡng tồn kho an toàn:
${lines}

Viết một đoạn cảnh báo ngắn (3-5 câu) cho chủ shop, nêu vật tư nào cấp bách nhất cần nhập trước, giọng văn thực tế và hữu ích.`;

    const summary = await this.gemini.generate(prompt);
    return { summary: summary.trim(), lowStockCount: lowStock.length };
  }
}
