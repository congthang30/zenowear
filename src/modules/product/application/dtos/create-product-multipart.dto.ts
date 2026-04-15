import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** Phần text của `multipart/form-data` khi tạo sản phẩm kèm upload ảnh. */
export class CreateProductMultipartDto {
  @ApiProperty({
    description:
      'Chuỗi JSON đúng schema CreateProductDto (productName, barcode, …, variants). URL ảnh trong JSON (nếu có) được gộp sau ảnh upload.',
  })
  @IsString()
  @IsNotEmpty()
  data!: string;
}
