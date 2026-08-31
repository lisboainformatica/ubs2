import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { Public } from './public.decorator';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  async login(
    @Body() body: LoginDto,
    @Req() req: Request
  ) {
    const ip = req.ip ?? null;
    const plainPassword = body.password || body.passwordHash || '';
    return this.authService.login(body.email, plainPassword, ip);
  }

  @Post('register')
  @Public()
  async register(
    @Body() body: RegisterPatientDto,
    @Req() req: Request
  ) {
    const ip = req.ip ?? null;
    return this.authService.registerPatient(body, ip);
  }

  @Post('create-user')
  async createUser(
    @Body() body: CreateUserDto,
    @Req() req: AuthenticatedRequest
  ) {
    const ip = req.ip ?? null;
    const adminUserId = req.user.userId;
    return this.authService.createInternalUser(body, adminUserId, ip);
  }
}

