import { Controller, Post, Body, UseGuards, Request, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../shared/guards/local-auth.guard';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { CsrfService } from '../../shared/services/csrf.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.login(req.user);
    const csrfToken = this.csrfService.generateToken(response, req.user);
    return { ...token, csrfToken };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    this.csrfService.clearToken(response);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  async refresh(@Request() req, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.login(req.user);
    const csrfToken = this.csrfService.generateToken(response, req.user);
    return { ...token, csrfToken };
  }
}
