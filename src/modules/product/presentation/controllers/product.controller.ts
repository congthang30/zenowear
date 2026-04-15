import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CloudinaryService } from '../../../../common/cloudinary/cloudinary.service';

import { CreateProductHandler } from '../../application/commands/create-product/create-product.handler';
import { GetProductHandler } from '../../application/queries/get-product/get-product.handler';
import { GetProductsHandler } from '../../application/queries/get-products/get-products.handler';

import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { CreateProductMultipartDto } from '../../application/dtos/create-product-multipart.dto';
import {
  PaginatedProductResponseDto,
  ProductResponseDto,
} from '../../application/dtos/product-response.dto';

import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { GetProductQuery } from '../../application/queries/get-product/get-product.query';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';

import { CreateProductResponseDto } from '../../application/dtos/create-product-response.dto';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly getProductHandler: GetProductHandler,
    private readonly getProductsHandler: GetProductsHandler,
    private readonly cloudinary: CloudinaryService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Tạo sản phẩm mới (multipart): data = JSON payload + ảnh upload Cloudinary',
    description:
      'Field `data`: chuỗi JSON giống schema CreateProductDto. Field `images`: 0..N file (JPEG/PNG/WebP, tối đa 5MB/file). URL sau upload được gộp vào đầu mảng `images` của sản phẩm (sau đó tới URL trong JSON nếu có). Ảnh biến thể vẫn chỉ qua URL trong JSON.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: {
          type: 'string',
          description: 'JSON CreateProductDto',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateProductResponseDto,
    description: 'Tạo sản phẩm thành công',
  })
  @UseInterceptors(
    FilesInterceptor('images', 25, {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype);
        if (!ok) {
          cb(
            new BadRequestException(
              'Ảnh sản phẩm chỉ chấp nhận JPEG, PNG hoặc WebP',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async createProduct(
    @Body() form: CreateProductMultipartDto,
    @UploadedFiles() imageFiles?: Express.Multer.File[],
  ): Promise<CreateProductResponseDto> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(form.data) as unknown;
    } catch {
      throw new BadRequestException('Trường data phải là JSON hợp lệ');
    }

    const dto = plainToInstance(CreateProductDto, parsed, {
      enableImplicitConversion: true,
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      const msg = errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; ');
      throw new BadRequestException(msg);
    }

    const baseFolder =
      this.config.get<string>('cloudinary.uploadFolder') ?? 'zenowear';
    const folder = `${baseFolder}/products`;

    const uploadedUrls =
      imageFiles?.length && imageFiles.some((f) => f.buffer?.length)
        ? await Promise.all(
            imageFiles
              .filter((f) => f.buffer?.length)
              .map((f) => this.cloudinary.uploadImageBuffer(f.buffer, { folder })),
          )
        : [];

    const fromFiles = uploadedUrls.map((r) => r.url);
    const mergedImages = [...fromFiles, ...(dto.images ?? [])];

    const productId = await this.createProductHandler.execute(
      new CreateProductCommand(
        dto.productName,
        dto.barcode,
        dto.description,
        dto.brandId,
        dto.categoryId,
        dto.variants,
        mergedImages.length ? mergedImages : undefined,
        dto.videoUrl,
      ),
    );

    return {
      id: productId,
      message: 'Tạo sản phẩm thành công.',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (phân trang)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedProductResponseDto })
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<PaginatedProductResponseDto> {
    return this.getProductsHandler.execute(
      new GetProductsQuery(Number(page), Number(limit)),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId của sản phẩm' })
  @ApiResponse({ status: HttpStatus.OK, type: ProductResponseDto })
  async getProduct(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.getProductHandler.execute(new GetProductQuery(id));
  }
}
