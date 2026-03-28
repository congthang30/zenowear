import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterHandler } from '../../application/commands/register/register.handler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly registerHandler: RegisterHandler) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: RegisterResponseDto })
  async register(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
    const { userId } = await this.registerHandler.execute(
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
}
