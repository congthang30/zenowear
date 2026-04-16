import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { AdminCreateCouponDto } from '../../application/dtos/admin-create-coupon.dto';
import { AdminUpdateCouponDto } from '../../application/dtos/admin-update-coupon.dto';
import { SetCouponStatusDto } from '../../application/dtos/set-coupon-status.dto';
import { AdminCreateCouponHandler } from '../../application/commands/admin-create-coupon/admin-create-coupon.handler';
import { AdminUpdateCouponHandler } from '../../application/commands/admin-update-coupon/admin-update-coupon.handler';
import { AdminSetCouponStatusHandler } from '../../application/commands/admin-set-coupon-status/admin-set-coupon-status.handler';
import { AdminListCouponsHandler } from '../../application/queries/admin-list-coupons/admin-list-coupons.handler';
import { CouponStatus } from '../../domain/enum/coupon-status.enum';
import type {
  CouponReadModel,
  CreateCouponInput,
} from '../../domain/repositories/coupon.repository.interface';

@ApiTags('Coupon (Admin)')
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class CouponAdminController {
  constructor(
    private readonly createHandler: AdminCreateCouponHandler,
    private readonly updateHandler: AdminUpdateCouponHandler,
    private readonly setStatusHandler: AdminSetCouponStatusHandler,
    private readonly listHandler: AdminListCouponsHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo coupon' })
  @ApiBody({ type: AdminCreateCouponDto })
  @ApiResponse({ status: HttpStatus.CREATED })
  async create(@Body() body: AdminCreateCouponDto): Promise<{ id: string }> {
    const input: CreateCouponInput = {
      code: body.code,
      name: body.name,
      description: body.description,
      type: body.type,
      value: body.value,
      minOrderAmount: body.minOrderAmount ?? 0,
      maxDiscountAmount: body.maxDiscountAmount ?? null,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status ?? CouponStatus.DRAFT,
      usageLimit: body.usageLimit ?? null,
      usagePerUser: body.usagePerUser ?? 1,
    };
    return this.createHandler.execute(input);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách coupon (admin)' })
  @ApiResponse({ status: HttpStatus.OK })
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ): Promise<{ data: CouponReadModel[]; total: number }> {
    return this.listHandler.execute(
      Number(page) || 1,
      Math.min(100, Number(limit) || 50),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cập nhật coupon' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: AdminUpdateCouponDto })
  async update(
    @Param('id') id: string,
    @Body() body: AdminUpdateCouponDto,
  ): Promise<void> {
    await this.updateHandler.execute(id, body);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kích hoạt / tắt / hết hạn (status)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: SetCouponStatusDto })
  async setStatus(
    @Param('id') id: string,
    @Body() body: SetCouponStatusDto,
  ): Promise<void> {
    await this.setStatusHandler.execute(id, body.status);
  }
}
