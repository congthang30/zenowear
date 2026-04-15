import {
  BadRequestException,
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
import { UpdateProductHandler } from '../../application/commands/update-product/update-product.handler';
import { SoftDeleteProductHandler } from '../../application/commands/soft-delete-product/soft-delete-product.handler';
import { ChangeProductStatusHandler } from '../../application/commands/change-product-status/change-product-status.handler';
import { MarkProductFeaturedHandler } from '../../application/commands/mark-product-featured/mark-product-featured.handler';
import { IncrementProductViewHandler } from '../../application/commands/increment-product-view/increment-product-view.handler';
import { AddProductVariantHandler } from '../../application/commands/add-product-variant/add-product-variant.handler';
import { UpdateProductVariantHandler } from '../../application/commands/update-product-variant/update-product-variant.handler';
import { DeleteProductVariantHandler } from '../../application/commands/delete-product-variant/delete-product-variant.handler';

import { GetProductHandler } from '../../application/queries/get-product/get-product.handler';
import { GetProductsHandler } from '../../application/queries/get-products/get-products.handler';

import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { CreateProductMultipartDto } from '../../application/dtos/create-product-multipart.dto';
import {
  PaginatedProductResponseDto,
  ProductResponseDto,
} from '../../application/dtos/product-response.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { ChangeProductStatusDto } from '../../application/dtos/change-product-status.dto';
import { MarkFeaturedDto } from '../../application/dtos/mark-featured.dto';
import { AddVariantDto } from '../../application/dtos/add-variant.dto';
import { UpdateVariantDto } from '../../application/dtos/update-variant.dto';
import { AddVariantResponseDto } from '../../application/dtos/add-variant-response.dto';

import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { UpdateProductCommand } from '../../application/commands/update-product/update-product.command';
import { SoftDeleteProductCommand } from '../../application/commands/soft-delete-product/soft-delete-product.command';
import { ChangeProductStatusCommand } from '../../application/commands/change-product-status/change-product-status.command';
import { MarkProductFeaturedCommand } from '../../application/commands/mark-product-featured/mark-product-featured.command';
import { IncrementProductViewCommand } from '../../application/commands/increment-product-view/increment-product-view.command';
import { AddProductVariantCommand } from '../../application/commands/add-product-variant/add-product-variant.command';
import { UpdateProductVariantCommand } from '../../application/commands/update-product-variant/update-product-variant.command';
import { DeleteProductVariantCommand } from '../../application/commands/delete-product-variant/delete-product-variant.command';

import { GetProductQuery } from '../../application/queries/get-product/get-product.query';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';

import { CreateProductResponseDto } from '../../application/dtos/create-product-response.dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly updateProductHandler: UpdateProductHandler,
    private readonly softDeleteProductHandler: SoftDeleteProductHandler,
    private readonly changeProductStatusHandler: ChangeProductStatusHandler,
    private readonly markProductFeaturedHandler: MarkProductFeaturedHandler,
    private readonly incrementProductViewHandler: IncrementProductViewHandler,
    private readonly addProductVariantHandler: AddProductVariantHandler,
    private readonly updateProductVariantHandler: UpdateProductVariantHandler,
    private readonly deleteProductVariantHandler: DeleteProductVariantHandler,
    private readonly getProductHandler: GetProductHandler,
    private readonly getProductsHandler: GetProductsHandler,
    private readonly cloudinary: CloudinaryService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Danh sách sản phẩm (phân trang, tìm kiếm, lọc brand/category/giá). Mặc định chỉ ACTIVE, chưa xóa mềm.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'catalogOnly',
    required: false,
    type: Boolean,
    description: 'true (mặc định): chỉ ACTIVE; false: mọi trạng thái (chưa xóa mềm)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedProductResponseDto })
  getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('catalogOnly') catalogOnly?: string,
  ): Promise<PaginatedProductResponseDto> {
    const catalog =
      catalogOnly === undefined ||
      catalogOnly === '' ||
      catalogOnly === 'true' ||
      catalogOnly === '1';
    return this.getProductsHandler.execute(
      new GetProductsQuery(
        Number(page) || 1,
        Number(limit) || 20,
        search,
        brandId,
        categoryId,
        minPrice !== undefined && minPrice !== ''
          ? Number(minPrice)
          : undefined,
        maxPrice !== undefined && maxPrice !== ''
          ? Number(maxPrice)
          : undefined,
        catalog,
      ),
    );
  }

  @Post(':id/views')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Tăng viewCount (chỉ sản phẩm ACTIVE, hiển thị)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async incrementView(@Param('id') id: string): Promise<void> {
    await this.incrementProductViewHandler.execute(
      new IncrementProductViewCommand(id),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Tạo sản phẩm + biến thể (multipart): data = JSON CreateProductDto + ảnh',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: { type: 'string', description: 'JSON CreateProductDto' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateProductResponseDto })
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
              .map((f) =>
                this.cloudinary.uploadImageBuffer(f.buffer, { folder }),
              ),
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi trạng thái sản phẩm (không dùng OUT_OF_STOCK thủ công)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: ChangeProductStatusDto })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: ChangeProductStatusDto,
  ): Promise<void> {
    await this.changeProductStatusHandler.execute(
      new ChangeProductStatusCommand(id, body.status),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/featured')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu nổi bật' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: MarkFeaturedDto })
  async markFeatured(
    @Param('id') id: string,
    @Body() body: MarkFeaturedDto,
  ): Promise<void> {
    await this.markProductFeaturedHandler.execute(
      new MarkProductFeaturedCommand(id, body.isFeatured),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/variants')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm biến thể' })
  @ApiParam({ name: 'id', description: 'productId' })
  @ApiBody({ type: AddVariantDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: AddVariantResponseDto })
  async addVariant(
    @Param('id') id: string,
    @Body() body: AddVariantDto,
  ): Promise<AddVariantResponseDto> {
    const variantId = await this.addProductVariantHandler.execute(
      new AddProductVariantCommand(
        id,
        body.sku,
        body.attributes,
        body.originalPrice,
        body.price,
        body.stock,
        body.isDefault,
        body.images,
      ),
    );
    return { id: variantId, message: 'Đã thêm biến thể.' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật biến thể' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'variantId' })
  @ApiBody({ type: UpdateVariantDto })
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: UpdateVariantDto,
  ): Promise<void> {
    await this.updateProductVariantHandler.execute(
      new UpdateProductVariantCommand(
        id,
        variantId,
        body.sku,
        body.attributes,
        body.originalPrice,
        body.price,
        body.stock,
        body.isDefault,
        body.images,
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id/variants/:variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa biến thể (soft delete)' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'variantId' })
  async deleteVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ): Promise<void> {
    await this.deleteProductVariantHandler.execute(
      new DeleteProductVariantCommand(id, variantId),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateProductDto })
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<void> {
    await this.updateProductHandler.execute(
      new UpdateProductCommand(
        id,
        body.productName,
        body.slug,
        body.barcode,
        body.description,
        body.tags,
        body.brandId,
        body.categoryId,
        body.images,
        body.videoUrl,
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa mềm sản phẩm (deletedAt + INACTIVE)' })
  @ApiParam({ name: 'id' })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.softDeleteProductHandler.execute(
      new SoftDeleteProductCommand(id),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chi tiết sản phẩm kèm biến thể (chỉ ACTIVE, chưa xóa mềm)',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: ProductResponseDto })
  async getProduct(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.getProductHandler.execute(new GetProductQuery(id));
  }
}
