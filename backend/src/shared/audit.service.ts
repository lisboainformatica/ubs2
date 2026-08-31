import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    details: any,
    ipAddress?: string,
    tx?: Prisma.TransactionClient
  ) {
    const detailsStr = details ? JSON.stringify(details) : null;
    const client = tx || this.prisma;
    await client.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: detailsStr,
        ipAddress: ipAddress || null,
      },
    });
  }
}
