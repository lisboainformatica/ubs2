import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; passwordHash: string }, @Req() req: Request) {
    const ip = req.ip || '127.0.0.1';
    return this.authService.login(body.email, body.passwordHash, ip);
  }

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      passwordHash: string;
      name: string;
      cpf: string;
      birthDate: string;
      phone: string;
      address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
      };
    },
    @Req() req: Request
  ) {
    const ip = req.ip || '127.0.0.1';
    return this.authService.registerPatient(body, ip);
  }

  @Post('create-user')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRADOR')
  async createUser(
    @Body()
    body: {
      email: string;
      passwordHash: string;
      name: string;
      role: string;
      doctorDetails?: {
        cpf: string;
        crm: string;
        specialtyIds: string[];
        ubsIds: string[];
      };
    },
    @Req() req: any
  ) {
    const ip = req.ip || '127.0.0.1';
    const adminUserId = req.user.userId;
    return this.authService.createInternalUser(body, adminUserId, ip);
  }
}
