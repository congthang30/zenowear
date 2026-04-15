import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { CreateProductHandler } from '../../application/commands/create-product/create-product.handler';
import { GetProductHandler } from '../../application/queries/get-product/get-product.handler';
import { GetProductsHandler } from '../../application/queries/get-products/get-products.handler';

import { CreateProductDto } from '../../application/dtos/create-product.dto';
import {
  PaginatedProductResponseDto,
  ProductResponseDto,
} from '../../application/dtos/product-response.dto';

import { CreateProductCommand } from '../../application/commands/create-product/create-product.command';
import { GetProductQuery } from '../../application/queries/get-product/get-product.query';
import { GetProductsQuery } from '../../application/queries/get-products/get-products.query';

import { CreateProductResponseDto } from '../../application/dtos/create-product-response.dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly getProductHandler: GetProductHandler,
    private readonly getProductsHandler: GetProductsHandler,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo sản phẩm mới (bao gồm variants)' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateProductResponseDto,
    description: 'Tạo sản phẩm thành công',
  })
  async createProduct(
    @Body() body: CreateProductDto,
  ): Promise<CreateProductResponseDto> {
    const productId = await this.createProductHandler.execute(
      new CreateProductCommand(
        body.productName,
        body.barcode,
        body.description,
        body.brandId,
        body.categoryId,
        body.variants,
        body.images,
        body.videoUrl,
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
