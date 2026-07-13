import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export const RESTORE_CONFIRMATION_PHRASE = 'XAC-NHAN-KHOI-PHUC-DU-LIEU';

export class RestoreBackupDto {
  @ApiProperty({
    description: `Phải nhập chính xác chuỗi "${RESTORE_CONFIRMATION_PHRASE}" để xác nhận khôi phục (thao tác sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại)`,
    example: RESTORE_CONFIRMATION_PHRASE,
  })
  @Equals(RESTORE_CONFIRMATION_PHRASE, { message: 'Chuỗi xác nhận không đúng' })
  confirmation: string;
}
