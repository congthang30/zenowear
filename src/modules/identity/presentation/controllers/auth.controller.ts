import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
import { RegisterDto } from '../../application/dtos/register.dto';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterHandler } from '../../application/commands/register/register.handler';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginResponseDto } from '../../application/dtos/login-reponse.dto';
import { LoginHandler } from '../../application/commands/login/login.handler';
import { LoginCommand } from '../../application/commands/login/login.command';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';
import { ChangeMyPasswordHandler } from '../../application/commands/change-my-password/change-my-password.handler';
import { ChangeMyPasswordCommand } from '../../application/commands/change-my-password/change-my-password.command';
import { LogoutResponseDto } from '../../application/dtos/logout-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
    private readonly changePasswordHandler: ChangeMyPasswordHandler,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: RegisterResponseDto })
  async register(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
    await this.registerHandler.execute(
      new RegisterCommand(
        body.email,
        body.password,
        body.rePassword,
        body.fullName,
        body.dateOfBirth,
      ),
    );
    return { message: 'Đăng ký thành công.' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    const { token } = await this.loginHandler.execute(
      new LoginCommand(body.email, body.password),
    );

    return { message: 'Đăng nhập thành công', token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đăng xuất',
    description:
      'Xác nhận user đang đăng nhập; client cần xóa access token. JWT stateless vẫn có hiệu lực đến khi hết hạn (chưa có denylist).',
  })
  @ApiResponse({ status: HttpStatus.OK, type: LogoutResponseDto })
  async logout(): Promise<LogoutResponseDto> {
    return { message: 'Đăng xuất thành công.' };
  }

  @Post('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật mật khẩu của user đang đăng nhập (JWT)' })
  async changePassword(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: ChangePasswordDto,
  ) {
    await this.changePasswordHandler.execute(
      new ChangeMyPasswordCommand(
        user.userId,
        body.password,
        body.newPassword,
        body.reNewPassword,
      ),
    );
    return {
      message: 'Password changed successfully',
    };
  }
}
