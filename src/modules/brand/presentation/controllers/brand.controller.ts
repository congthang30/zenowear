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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateBrandHandler } from '../../application/commands/create-brand/create-brand.handler';
import { CreateBrandDto } from '../../application/dtos/createBrand.dto';
import { CreateBrandResponseDto } from '../../application/dtos/createBrand-reponse.dto';
import { CreateBrandCommand } from '../../application/commands/create-brand/create-brand.command';
import { UpdateBrandHandler } from '../../application/commands/update-brand/update-brand.handler';
import { UpdateBrandCommand } from '../../application/commands/update-brand/update-brand.command';
import { UpdateBrandDto } from '../../application/dtos/update-brand.dto';
import { SoftDeleteBrandHandler } from '../../application/commands/soft-delete-brand/soft-delete-brand.handler';
import { SoftDeleteBrandCommand } from '../../application/commands/soft-delete-brand/soft-delete-brand.command';
import { ChangeBrandStatusHandler } from '../../application/commands/change-brand-status/change-brand-status.handler';
import { ChangeBrandStatusCommand } from '../../application/commands/change-brand-status/change-brand-status.command';
import { ChangeBrandStatusDto } from '../../application/dtos/change-brand-status.dto';
import { GetActiveBrandsHandler } from '../../application/queries/get-active-brands/get-active-brands.handler';
import { GetBrandByIdHandler } from '../../application/queries/get-brand-by-id/get-brand-by-id.handler';
import { GetBrandByIdQuery } from '../../application/queries/get-brand-by-id/get-brand-by-id.query';
import { BrandResponseDto } from '../../application/dtos/brand-response.dto';

@ApiTags('Brand')
@Controller('brands')
export class BrandController {
  constructor(
    private readonly createBrandHandler: CreateBrandHandler,
    private readonly updateBrandHandler: UpdateBrandHandler,
    private readonly softDeleteBrandHandler: SoftDeleteBrandHandler,
    private readonly changeBrandStatusHandler: ChangeBrandStatusHandler,
    private readonly getActiveBrandsHandler: GetActiveBrandsHandler,
    private readonly getBrandByIdHandler: GetBrandByIdHandler,
  ) {}

  @Get('active')
  @ApiOperation({ summary: 'Danh sách thương hiệu ACTIVE' })
  @ApiResponse({ status: HttpStatus.OK, type: [BrandResponseDto] })
  listActive(): Promise<BrandResponseDto[]> {
    return this.getActiveBrandsHandler.execute();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết thương hiệu (chỉ ACTIVE — ẩn với user nếu khác ACTIVE)',
  })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, type: BrandResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  getById(@Param('id') id: string): Promise<BrandResponseDto> {
    return this.getBrandByIdHandler.execute(new GetBrandByIdQuery(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo thương hiệu (admin)' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateBrandResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Trùng tên' })
  async create(@Body() body: CreateBrandDto): Promise<CreateBrandResponseDto> {
    const id = await this.createBrandHandler.execute(
      new CreateBrandCommand(
        body.name,
        body.logo?.trim() || null,
        body.description?.trim() || null,
        body.status,
      ),
    );
    return { id, message: 'Tạo thương hiệu thành công.' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cập nhật thương hiệu (admin)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Trùng tên' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBrandDto,
  ): Promise<void> {
    await this.updateBrandHandler.execute(
      new UpdateBrandCommand(
        id,
        body.name,
        body.logo === undefined ? undefined : body.logo?.trim() || null,
        body.description === undefined
          ? undefined
          : body.description?.trim() || null,
      ),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm — INACTIVE, không xóa DB (admin)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.softDeleteBrandHandler.execute(new SoftDeleteBrandCommand(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đổi trạng thái (admin)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: ChangeBrandStatusDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: ChangeBrandStatusDto,
  ): Promise<void> {
    await this.changeBrandStatusHandler.execute(
      new ChangeBrandStatusCommand(id, body.status),
    );
  }
}
