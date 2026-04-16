import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';
import { ValidateCouponDto } from '../../application/dtos/validate-coupon.dto';
import { CouponQuoteResponseDto } from '../../application/dtos/coupon-quote-response.dto';
import { CouponUsageHistoryItemDto } from '../../application/dtos/coupon-usage-history.dto';
import { ValidateCouponForUserHandler } from '../../application/quotes/validate-coupon-for-user.handler';
import { ListMyCouponUsagesHandler } from '../../application/queries/list-my-coupon-usages/list-my-coupon-usages.handler';

@ApiTags('Coupon')
@Controller('coupons')
export class CouponController {
  constructor(
    private readonly validateHandler: ValidateCouponForUserHandler,
    private readonly listUsagesHandler: ListMyCouponUsagesHandler,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Kiểm tra mã (active, hạn, lượt user, min đơn…) — có subtotalAmount thì không cần giỏ',
  })
  @ApiBody({ type: ValidateCouponDto })
  @ApiResponse({ status: HttpStatus.OK, type: CouponQuoteResponseDto })
  validate(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: ValidateCouponDto,
  ): Promise<CouponQuoteResponseDto> {
    return this.validateHandler.execute(
      user.userId,
      body.code,
      body.subtotalAmount,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply-preview')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Áp mã theo giỏ hiện tại — trả discountAmount, finalAmount, appliedCoupon',
  })
  @ApiBody({ type: ValidateCouponDto })
  @ApiResponse({ status: HttpStatus.OK, type: CouponQuoteResponseDto })
  applyPreview(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: ValidateCouponDto,
  ): Promise<CouponQuoteResponseDto> {
    return this.validateHandler.execute(user.userId, body.code, undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/usages')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lịch sử dùng mã của tôi' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: HttpStatus.OK })
  listMyUsages(
    @CurrentUser() user: JwtAccessPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<{ data: CouponUsageHistoryItemDto[]; total: number }> {
    return this.listUsagesHandler.execute(
      user.userId,
      Number(page) || 1,
      Math.min(100, Number(limit) || 20),
    );
  }
}
