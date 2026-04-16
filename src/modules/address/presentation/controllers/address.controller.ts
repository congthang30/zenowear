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
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';
import { CreateAddressDto } from '../../application/dtos/create-address.dto';
import { UpdateAddressDto } from '../../application/dtos/update-address.dto';
import {
  AddressResponseDto,
} from '../../application/dtos/address-response.dto';
import { CreateAddressHandler } from '../../application/commands/create-address/create-address.handler';
import { CreateAddressCommand } from '../../application/commands/create-address/create-address.command';
import { UpdateAddressHandler } from '../../application/commands/update-address/update-address.handler';
import { UpdateAddressCommand } from '../../application/commands/update-address/update-address.command';
import { DeleteAddressHandler } from '../../application/commands/delete-address/delete-address.handler';
import { DeleteAddressCommand } from '../../application/commands/delete-address/delete-address.command';
import { ListMyAddressesHandler } from '../../application/queries/list-my-addresses/list-my-addresses.handler';
import { ListMyAddressesQuery } from '../../application/queries/list-my-addresses/list-my-addresses.query';
import { CreateAddressResponseDto } from '../../application/dtos/create-address-response.dto';

@ApiTags('Address')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(
    private readonly createAddressHandler: CreateAddressHandler,
    private readonly updateAddressHandler: UpdateAddressHandler,
    private readonly deleteAddressHandler: DeleteAddressHandler,
    private readonly listMyAddressesHandler: ListMyAddressesHandler,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách địa chỉ của tôi' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressResponseDto] })
  list(
    @CurrentUser() user: JwtAccessPayload,
  ): Promise<AddressResponseDto[]> {
    return this.listMyAddressesHandler.execute(
      new ListMyAddressesQuery(user.userId),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm địa chỉ' })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateAddressResponseDto })
  create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: CreateAddressDto,
  ): Promise<CreateAddressResponseDto> {
    return this.createAddressHandler.execute(
      new CreateAddressCommand(
        user.userId,
        body.fullName,
        body.phone,
        body.line1,
        body.city,
        body.line2,
        body.district,
        body.country,
      ),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sửa địa chỉ' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateAddressDto })
  async update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() body: UpdateAddressDto,
  ): Promise<void> {
    await this.updateAddressHandler.execute(
      new UpdateAddressCommand(user.userId, id, body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa địa chỉ' })
  @ApiParam({ name: 'id' })
  async remove(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.deleteAddressHandler.execute(
      new DeleteAddressCommand(user.userId, id),
    );
  }
}
