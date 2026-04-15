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
import { CreateCategoryHandler } from '../../application/commands/create-category/create-category.handler';
import { CreateCategoryDto } from '../../application/dtos/createCategory.dto';
import { CreateCategoryResponseDto } from '../../application/dtos/createCategory-reponse.dto';
import { CreateCategoryCommand } from '../../application/commands/create-category/create-category.command';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UpdateCategoryHandler } from '../../application/commands/update-category/update-category.handler';
import { UpdateCategoryCommand } from '../../application/commands/update-category/update-category.command';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { SoftDeleteCategoryHandler } from '../../application/commands/soft-delete-category/soft-delete-category.handler';
import { SoftDeleteCategoryCommand } from '../../application/commands/soft-delete-category/soft-delete-category.command';
import { ChangeCategoryStatusHandler } from '../../application/commands/change-category-status/change-category-status.handler';
import { ChangeCategoryStatusCommand } from '../../application/commands/change-category-status/change-category-status.command';
import { ChangeCategoryStatusDto } from '../../application/dtos/change-category-status.dto';
import { GetActiveCategoriesHandler } from '../../application/queries/get-active-categories/get-active-categories.handler';
import { GetCategoryByIdHandler } from '../../application/queries/get-category-by-id/get-category-by-id.handler';
import { GetCategoryByIdQuery } from '../../application/queries/get-category-by-id/get-category-by-id.query';
import { GetCategoryTreeHandler } from '../../application/queries/get-category-tree/get-category-tree.handler';
import { CategoryResponseDto } from '../../application/dtos/category-response.dto';
import { CategoryTreeNodeDto } from '../../application/dtos/category-tree-node.dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryHandler: CreateCategoryHandler,
    private readonly updateCategoryHandler: UpdateCategoryHandler,
    private readonly softDeleteCategoryHandler: SoftDeleteCategoryHandler,
    private readonly changeCategoryStatusHandler: ChangeCategoryStatusHandler,
    private readonly getActiveCategoriesHandler: GetActiveCategoriesHandler,
    private readonly getCategoryByIdHandler: GetCategoryByIdHandler,
    private readonly getCategoryTreeHandler: GetCategoryTreeHandler,
  ) {}

  @Get('active')
  @ApiOperation({ summary: 'Danh sách danh mục ACTIVE (cho storefront)' })
  @ApiResponse({ status: HttpStatus.OK, type: [CategoryResponseDto] })
  async listActive(): Promise<CategoryResponseDto[]> {
    return this.getActiveCategoriesHandler.execute();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Cây danh mục ACTIVE (cha–con)' })
  @ApiResponse({ status: HttpStatus.OK, type: [CategoryTreeNodeDto] })
  async tree(): Promise<CategoryTreeNodeDto[]> {
    return this.getCategoryTreeHandler.execute();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết danh mục theo id (chỉ ACTIVE — ẩn với user nếu khác ACTIVE)',
  })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, type: CategoryResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async getById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.getCategoryByIdHandler.execute(new GetCategoryByIdQuery(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo danh mục (admin)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateCategoryResponseDto })
  async create(
    @Body() body: CreateCategoryDto,
  ): Promise<CreateCategoryResponseDto> {
    const id = await this.createCategoryHandler.execute(
      new CreateCategoryCommand(body.name, body.parentId, body.status),
    );
    return { id, message: 'Tạo danh mục thành công.' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cập nhật tên / cha (admin)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<void> {
    await this.updateCategoryHandler.execute(
      new UpdateCategoryCommand(id, body.name, body.parentId),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa mềm — đặt INACTIVE, không xóa DB (admin)',
  })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.softDeleteCategoryHandler.execute(
      new SoftDeleteCategoryCommand(id),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đổi trạng thái danh mục (admin)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: ChangeCategoryStatusDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: ChangeCategoryStatusDto,
  ): Promise<void> {
    await this.changeCategoryStatusHandler.execute(
      new ChangeCategoryStatusCommand(id, body.status),
    );
  }
}
