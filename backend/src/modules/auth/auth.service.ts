import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../../shared/audit.service';
import { JwtPayload } from './interfaces/authenticated-request.interface';
import { normalizeCpf, validateCpf } from '../../shared/utils/cpf.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private audit: AuditService
  ) {}

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado no ambiente.');
    }

    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role, name: user.name };
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '24h',
    });

    // Check if patient details exist to return patientId
    let patientId: string | null = null;
    if (user.role === 'PACIENTE') {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
      });
      patientId = patient ? patient.id : null;
    }

    // Check if doctor details exist to return doctorId
    let doctorId: string | null = null;
    if (user.role === 'MEDICO') {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });
      doctorId = doctor ? doctor.id : null;
    }

    await this.audit.log(user.id, 'LOGIN', 'User', user.id, { email: user.email }, ipAddress ?? null);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        patientId,
        doctorId,
      },
    };
  }

  async registerPatient(data: {
    email: string;
    password?: string;
    passwordHash?: string; // fallback mapping if frontend still sends it before Phase 6
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
  }, ipAddress?: string) {
    const plainPassword = data.password || data.passwordHash;
    if (!plainPassword) {
      throw new BadRequestException('A senha é obrigatória.');
    }

    // Normalize and validate CPF
    const normalizedCpf = normalizeCpf(data.cpf);
    if (!validateCpf(normalizedCpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('E-mail já cadastrado.');
    }

    // Check if CPF already exists
    const existingPatient = await this.prisma.patient.findUnique({
      where: { cpf: normalizedCpf },
    });
    if (existingPatient) {
      throw new BadRequestException('CPF já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          role: 'PACIENTE',
          name: data.name,
        },
      });

      // 2. Create Address
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

      // 3. Determine UBS of Reference by Neighborhood (Zone mapping)
      const matchedZone = await tx.serviceZone.findFirst({
        where: {
          neighborhood: {
            equals: data.address.neighborhood,
          },
        },
      });

      let routingUbsId: string | null = null;
      if (matchedZone) {
        routingUbsId = matchedZone.ubsId;
      } else {
        const defaultUbs = await tx.uBS.findFirst({
          where: { status: 'ACTIVE' },
        });
        if (defaultUbs) {
          routingUbsId = defaultUbs.id;
        }
      }

      // 4. Create Patient
      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          name: data.name,
          cpf: normalizedCpf,
          birthDate: new Date(data.birthDate),
          phone: data.phone,
          email: data.email,
          addressId: address.id,
          routingUbsId,
        },
      });


      await this.audit.log(
        user.id,
        'CREATE',
        'Patient',
        patient.id,
        { email: user.email, routingUbsId },
        ipAddress ?? undefined,
        tx
      );

      return {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        routingUbsId,
      };
    });
  }

  async createInternalUser(data: {
    email: string;
    password?: string;
    passwordHash?: string; // fallback mapping
    name: string;
    role: string;
    doctorDetails?: {
      cpf: string;
      crm: string;
      specialtyIds: string[];
      ubsIds: string[];
    };
  }, adminUserId: string, ipAddress?: string) {
    const plainPassword = data.password || data.passwordHash;
    if (!plainPassword) {
      throw new BadRequestException('A senha é obrigatória.');
    }

    const allowedRoles = ['ADMINISTRADOR', 'GESTOR', 'MEDICO', 'ATENDENTE', 'FARMACEUTICO'];
    if (!allowedRoles.includes(data.role)) {
      throw new BadRequestException('Role inválida.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('E-mail já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          role: data.role,
          name: data.name,
        },
      });

      if (data.role === 'MEDICO') {
        if (!data.doctorDetails) {
          throw new BadRequestException('Detalhes do médico são obrigatórios.');
        }

        // Normalize and validate doctor CPF
        const normalizedCpf = normalizeCpf(data.doctorDetails.cpf);
        if (!validateCpf(normalizedCpf)) {
          throw new BadRequestException('CPF de médico inválido.');
        }

        // Check if CPF or CRM already exists
        const existingCpf = await tx.doctor.findUnique({ where: { cpf: normalizedCpf } });
        if (existingCpf) throw new BadRequestException('CPF de médico já cadastrado.');

        const existingCrm = await tx.doctor.findUnique({ where: { crm: data.doctorDetails.crm } });
        if (existingCrm) throw new BadRequestException('CRM de médico já cadastrado.');

        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            name: data.name,
            cpf: normalizedCpf,
            crm: data.doctorDetails.crm,
          },
        });

        // Link specialties
        if (data.doctorDetails.specialtyIds?.length > 0) {
          await tx.doctorSpecialty.createMany({
            data: data.doctorDetails.specialtyIds.map((specId) => ({
              doctorId: doctor.id,
              specialtyId: specId,
            })),
          });
        }

        // Link UBS
        if (data.doctorDetails.ubsIds?.length > 0) {
          await tx.doctorUbs.createMany({
            data: data.doctorDetails.ubsIds.map((ubsId) => ({
              doctorId: doctor.id,
              ubsId: ubsId,
            })),
          });
        }
      }

      await this.audit.log(
        adminUserId,
        'CREATE',
        'User',
        user.id,
        { email: user.email, role: user.role },
        ipAddress ?? undefined,
        tx
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    });
  }
}
