import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';
import { AddCartItemHandler } from '../../application/commands/add-cart-item/add-cart-item.handler';
import { AddCartItemCommand } from '../../application/commands/add-cart-item/add-cart-item.command';
import { AdjustCartItemQuantityHandler } from '../../application/commands/adjust-cart-item-quantity/adjust-cart-item-quantity.handler';
import { AdjustCartItemQuantityCommand } from '../../application/commands/adjust-cart-item-quantity/adjust-cart-item-quantity.command';
import { RemoveCartItemHandler } from '../../application/commands/remove-cart-item/remove-cart-item.handler';
import { RemoveCartItemCommand } from '../../application/commands/remove-cart-item/remove-cart-item.command';
import { AddCartItemDto } from '../../application/dtos/add-cart-item.dto';
import { AdjustCartItemQuantityDto } from '../../application/dtos/adjust-cart-item-quantity.dto';
import { CartResponseDto } from '../../application/dtos/cart-response.dto';
import { RemoveCartItemDto } from '../../application/dtos/remove-cart-item.dto';
import { GetMyCartHandler } from '../../application/queries/get-my-cart/get-my-cart.handler';
import { GetMyCartQuery } from '../../application/queries/get-my-cart/get-my-cart.query';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly getMyCartHandler: GetMyCartHandler,
    private readonly addCartItemHandler: AddCartItemHandler,
    private readonly removeCartItemHandler: RemoveCartItemHandler,
    private readonly adjustCartItemQuantityHandler: AdjustCartItemQuantityHandler,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy giỏ hàng của user đang đăng nhập' })
  @ApiResponse({ status: HttpStatus.OK, type: CartResponseDto })
  async getMyCart(
    @CurrentUser() user: JwtAccessPayload,
  ): Promise<CartResponseDto> {
    return this.getMyCartHandler.execute(new GetMyCartQuery(user.userId));
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thêm hoặc cộng dồn sản phẩm vào giỏ' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: HttpStatus.OK, type: CartResponseDto })
  async addItem(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: AddCartItemDto,
  ): Promise<CartResponseDto> {
    return this.addCartItemHandler.execute(
      new AddCartItemCommand(
        user.userId,
        body.productId,
        body.variantId,
        body.quantity,
      ),
    );
  }

  @Delete('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa một dòng sản phẩm khỏi giỏ' })
  @ApiBody({ type: RemoveCartItemDto })
  @ApiResponse({ status: HttpStatus.OK, type: CartResponseDto })
  async removeItem(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: RemoveCartItemDto,
  ): Promise<CartResponseDto> {
    return this.removeCartItemHandler.execute(
      new RemoveCartItemCommand(user.userId, body.productId, body.variantId),
    );
  }

  @Patch('items/quantity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tăng/giảm số lượng (delta dương hoặc âm; về 0 thì xóa dòng)',
  })
  @ApiBody({ type: AdjustCartItemQuantityDto })
  @ApiResponse({ status: HttpStatus.OK, type: CartResponseDto })
  async adjustQuantity(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: AdjustCartItemQuantityDto,
  ): Promise<CartResponseDto> {
    return this.adjustCartItemQuantityHandler.execute(
      new AdjustCartItemQuantityCommand(
        user.userId,
        body.productId,
        body.variantId,
        body.delta,
      ),
    );
  }
}
