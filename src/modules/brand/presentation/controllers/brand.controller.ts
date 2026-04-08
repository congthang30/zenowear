import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateBrandHandler } from '../../application/commands/create-brand/create-category.handler';
import { CreateBrandDto } from '../../application/dtos/createCategory.dto';
import { CreateBrandResponseDto } from '../../application/dtos/createBrand-reponse.dto';
import { CreateBrandCommand } from '../../application/commands/create-brand/create-category.command';

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly createBrandHandler: CreateBrandHandler) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('brand')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo thương hiệu mới' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateBrandResponseDto })
  async register(
    @Body() body: CreateBrandDto,
  ): Promise<CreateBrandResponseDto> {
    await this.createBrandHandler.execute(
      new CreateBrandCommand(body.brandName, body.brandStatus),
    );
    return { message: 'Tạo thương hiệu mới thành công.' };
  }
}
