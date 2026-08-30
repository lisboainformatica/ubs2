import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    details: any,
    ipAddress?: string
  ) {
    try {
      const detailsStr = details ? JSON.stringify(details) : null;
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details: detailsStr,
          ipAddress: ipAddress || '127.0.0.1',
        },
      });
    } catch (error) {
      console.error('Falha ao gravar log de auditoria:', error);
    }
  }
}
