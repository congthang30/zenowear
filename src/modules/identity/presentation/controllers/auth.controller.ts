import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RegisterResponseDto } from '../../application/dtos/register-response.dto';
import { RegisterCommand } from '../../application/commands/register/register.command';
import { RegisterHandler } from '../../application/commands/register/register.handler';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginResponseDto } from '../../application/dtos/login-reponse.dto';
import { LoginHandler } from '../../application/commands/login/login.handler';
import { LoginCommand } from '../../application/commands/login/login.command';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerHandler: RegisterHandler,
    private readonly loginHandler: LoginHandler,
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
}
