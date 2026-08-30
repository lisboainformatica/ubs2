import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, the endpoint is public or doesn't require specific roles
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const token = authHeader.split(' ')[1];
    try {
      // In development, we use a fixed secret key "ubs_super_secret_key_2026"
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'ubs_super_secret_key_2026',
      });
      request.user = payload;
    } catch (err) {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
    }

    const user = request.user;
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
    }

    return true;
  }
}
