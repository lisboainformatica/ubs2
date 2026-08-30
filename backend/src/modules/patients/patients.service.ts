import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { AuditService } from '../../shared/audit.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async findMe(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: {
        address: true,
        routingUbs: {
          include: { address: true },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Perfil de paciente não encontrado.');
    }

    return patient;
  }

  async updateMe(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      address?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
      };
    }
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { address: true },
    });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    return await this.prisma.$transaction(async (tx) => {
      let addressId = patient.addressId;
      let routingUbsId = patient.routingUbsId;

      if (data.address) {
        // Update address
        const updatedAddress = await tx.address.update({
          where: { id: patient.addressId },
          data: {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement || null,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
          },
        });
        addressId = updatedAddress.id;

        // Re-calculate UBS of Reference
        const matchedZone = await tx.serviceZone.findFirst({
          where: { neighborhood: data.address.neighborhood },
        });

        if (matchedZone) {
          routingUbsId = matchedZone.ubsId;
        } else {
          // Fallback to first active UBS
          const defaultUbs = await tx.uBS.findFirst({ where: { status: 'ACTIVE' } });
          if (defaultUbs) {
            routingUbsId = defaultUbs.id;
          }
        }
      }

      const updatedPatient = await tx.patient.update({
        where: { id: patient.id },
        data: {
          name: data.name,
          phone: data.phone,
          routingUbsId,
        },
        include: {
          address: true,
          routingUbs: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          resource: 'Patient',
          resourceId: patient.id,
          details: JSON.stringify({ name: data.name, routingUbsId }),
        },
      });

      return updatedPatient;
    });
  }

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { cpf: { contains: search } },
      ];
    }

    return this.prisma.patient.findMany({
      where,
      include: {
        address: true,
        routingUbs: true,
      },
    });
  }

  async createPatientOperational(
    data: {
      name: string;
      cpf: string;
      birthDate: string;
      phone: string;
      email: string;
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
    operatorUserId: string
  ) {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { cpf: data.cpf },
    });
    if (existingPatient) {
      throw new BadRequestException('CPF já cadastrado.');
    }

    return await this.prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement || null,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
        },
      });

      // Calculate UBS of reference
      const matchedZone = await tx.serviceZone.findFirst({
        where: { neighborhood: data.address.neighborhood },
      });

      let routingUbsId: string | null = null;
      if (matchedZone) {
        routingUbsId = matchedZone.ubsId;
      } else {
        const defaultUbs = await tx.uBS.findFirst({ where: { status: 'ACTIVE' } });
        if (defaultUbs) {
          routingUbsId = defaultUbs.id;
        }
      }

      const patient = await tx.patient.create({
        data: {
          name: data.name,
          cpf: data.cpf,
          birthDate: new Date(data.birthDate),
          phone: data.phone,
          email: data.email,
          addressId: address.id,
          routingUbsId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: operatorUserId,
          action: 'CREATE',
          resource: 'Patient',
          resourceId: patient.id,
          details: JSON.stringify({ name: patient.name, cpf: patient.cpf }),
        },
      });

      return patient;
    });
  }
}
