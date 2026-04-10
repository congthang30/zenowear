import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCategoryHandler } from '../../application/commands/create-category/create-category.handler';
import { CreateCategoryDto } from '../../application/dtos/createCategory.dto';
import { CreateCategoryResponseDto } from '../../application/dtos/createCategory-reponse.dto';
import { CreateCategoryCommand } from '../../application/commands/create-category/create-category.command';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly createCategoryHandler: CreateCategoryHandler) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateCategoryResponseDto })
  async register(
    @Body() body: CreateCategoryDto,
  ): Promise<CreateCategoryResponseDto> {
    await this.createCategoryHandler.execute(
      new CreateCategoryCommand(body.categoryName, body.categoryStatus),
    );
    return { message: 'Tạo danh mục thành công.' };
  }
}
