import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeadura do banco de dados...');

  // 1. Limpar banco
  await prisma.auditLog.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.medicationReservation.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.medicationLot.deleteMany({});
  await prisma.medication.deleteMany({});
  await prisma.examRequestItem.deleteMany({});
  await prisma.examRequest.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorSchedule.deleteMany({});
  await prisma.doctorSpecialty.deleteMany({});
  await prisma.doctorUbs.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.serviceZone.deleteMany({});
  await prisma.ubsSpecialty.deleteMany({});
  await prisma.uBS.deleteMany({});
  await prisma.specialty.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash de senhas padronizadas
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const gestorPasswordHash = await bcrypt.hash('gestor123', 10);
  const doctorPasswordHash = await bcrypt.hash('medico123', 10);
  const atendentePasswordHash = await bcrypt.hash('atendente123', 10);
  const farmaceuticoPasswordHash = await bcrypt.hash('farmaceutico123', 10);
  const patientPasswordHash = await bcrypt.hash('paciente123', 10);

  // 3. Criar Usuários
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ubs.com',
      passwordHash: adminPasswordHash,
      role: 'ADMINISTRADOR',
      name: 'Administrador Geral',
    },
  });

  const gestorUser = await prisma.user.create({
    data: {
      email: 'gestor@ubs.com',
      passwordHash: gestorPasswordHash,
      role: 'GESTOR',
      name: 'Gestor Carlos',
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'medico@ubs.com',
      passwordHash: doctorPasswordHash,
      role: 'MEDICO',
      name: 'Dr. Carlos Silva',
    },
  });

  const atendenteUser = await prisma.user.create({
    data: {
      email: 'atendente@ubs.com',
      passwordHash: atendentePasswordHash,
      role: 'ATENDENTE',
      name: 'Atendente Maria',
    },
  });

  const farmaceuticoUser = await prisma.user.create({
    data: {
      email: 'farmaceutico@ubs.com',
      passwordHash: farmaceuticoPasswordHash,
      role: 'FARMACEUTICO',
      name: 'Dra. Ana Ramos',
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      email: 'paciente@ubs.com',
      passwordHash: patientPasswordHash,
      role: 'PACIENTE',
      name: 'João Costa',
    },
  });

  // 4. Criar Endereços para UBS
  const addrUbs1 = await prisma.address.create({
    data: {
      street: 'Avenida Getúlio Vargas',
      number: '1500',
      complement: 'Térreo',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
    },
  });

  const addrUbs2 = await prisma.address.create({
    data: {
      street: 'Rua das Flores',
      number: '500',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01400-000',
    },
  });

  // 5. Criar UBS
  const ubsCentro = await prisma.uBS.create({
    data: {
      name: 'UBS Centro',
      code: 'UBS-001',
      addressId: addrUbs1.id,
      phone: '(11) 3222-1111',
      email: 'centro@ubs.gov.br',
      status: 'ACTIVE',
      latitude: -23.55052,
      longitude: -46.633308,
      capacity: 100,
    },
  });

  const ubsPaulista = await prisma.uBS.create({
    data: {
      name: 'UBS Paulista',
      code: 'UBS-002',
      addressId: addrUbs2.id,
      phone: '(11) 3888-2222',
      email: 'paulista@ubs.gov.br',
      status: 'ACTIVE',
      latitude: -23.5658,
      longitude: -46.6512,
      capacity: 80,
    },
  });

  // 6. Criar Zonas de Atendimento
  await prisma.serviceZone.create({
    data: { ubsId: ubsCentro.id, neighborhood: 'Centro' },
  });
  await prisma.serviceZone.create({
    data: { ubsId: ubsCentro.id, neighborhood: 'Bela Vista' },
  });
  await prisma.serviceZone.create({
    data: { ubsId: ubsPaulista.id, neighborhood: 'Jardim Paulista' },
  });
  await prisma.serviceZone.create({
    data: { ubsId: ubsPaulista.id, neighborhood: 'Consolação' },
  });

  // 7. Criar Especialidades
  const specClinica = await prisma.specialty.create({
    data: { name: 'Clínica Geral', description: 'Atendimento geral adulto' },
  });
  const specPediatria = await prisma.specialty.create({
    data: { name: 'Pediatria', description: 'Atendimento infantil' },
  });
  const specCardio = await prisma.specialty.create({
    data: { name: 'Cardiologia', description: 'Atendimento do coração' },
  });
  const specGineco = await prisma.specialty.create({
    data: { name: 'Ginecologia', description: 'Saúde da mulher' },
  });

  // 8. Vincular Especialidades às UBS
  // UBS Centro tem: Clínica Geral, Pediatria
  await prisma.ubsSpecialty.create({ data: { ubsId: ubsCentro.id, specialtyId: specClinica.id } });
  await prisma.ubsSpecialty.create({ data: { ubsId: ubsCentro.id, specialtyId: specPediatria.id } });
  // UBS Paulista tem: Clínica Geral, Cardiologia, Ginecologia
  await prisma.ubsSpecialty.create({ data: { ubsId: ubsPaulista.id, specialtyId: specClinica.id } });
  await prisma.ubsSpecialty.create({ data: { ubsId: ubsPaulista.id, specialtyId: specCardio.id } });
  await prisma.ubsSpecialty.create({ data: { ubsId: ubsPaulista.id, specialtyId: specGineco.id } });

  // 9. Criar Médicos
  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      name: 'Dr. Carlos Silva',
      cpf: '11111111111',
      crm: '123456-SP',
      status: 'ACTIVE',
    },
  });

  // Vincular especialidades ao médico (Clínica Geral, Pediatria)
  await prisma.doctorSpecialty.create({ data: { doctorId: doctor.id, specialtyId: specClinica.id } });
  await prisma.doctorSpecialty.create({ data: { doctorId: doctor.id, specialtyId: specPediatria.id } });

  // Vincular médico às UBS
  await prisma.doctorUbs.create({ data: { doctorId: doctor.id, ubsId: ubsCentro.id } });
  await prisma.doctorUbs.create({ data: { doctorId: doctor.id, ubsId: ubsPaulista.id } });

  // Criar agenda do médico (Segunda-feira na UBS Centro das 08:00 às 12:00, Terça na UBS Paulista das 13:00 às 17:00)
  await prisma.doctorSchedule.create({
    data: {
      doctorId: doctor.id,
      ubsId: ubsCentro.id,
      dayOfWeek: 1, // Segunda
      startTime: '08:00',
      endTime: '12:00',
      intervalMin: 30,
    },
  });

  await prisma.doctorSchedule.create({
    data: {
      doctorId: doctor.id,
      ubsId: ubsPaulista.id,
      dayOfWeek: 2, // Terça
      startTime: '13:00',
      endTime: '17:00',
      intervalMin: 30,
    },
  });

  // 10. Criar Paciente João
  const patientAddr = await prisma.address.create({
    data: {
      street: 'Rua Augusta',
      number: '200',
      neighborhood: 'Consolação', // Vincula à UBS Paulista de referência
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01300-000',
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      name: 'João Costa',
      cpf: '22222222222',
      birthDate: new Date('1990-05-15'),
      phone: '(11) 99999-8888',
      email: 'paciente@ubs.com',
      addressId: patientAddr.id,
      routingUbsId: ubsPaulista.id, // Consolação está na zona da UBS Paulista
    },
  });

  // 11. Criar Medicamentos
  const medParacetamol = await prisma.medication.create({
    data: { name: 'Paracetamol 500mg', dosageForm: 'Comprimido', minStock: 20, targetStock: 200, status: 'ACTIVE' },
  });

  const medAmoxicilina = await prisma.medication.create({
    data: { name: 'Amoxicilina 500mg', dosageForm: 'Comprimido', minStock: 15, targetStock: 100, status: 'ACTIVE' },
  });

  const medIbuprofeno = await prisma.medication.create({
    data: { name: 'Ibuprofeno 400mg', dosageForm: 'Comprimido', minStock: 10, targetStock: 150, status: 'ACTIVE' },
  });

  // 12. Cadastrar Lotes nos Estoques das UBS (FEFO ready!)
  const now = new Date();

  // Paracetamol na UBS Centro
  // Lote 1: Vence em 30 dias (Mais próximo)
  const lotPara1 = await prisma.medicationLot.create({
    data: {
      ubsId: ubsCentro.id,
      medicationId: medParacetamol.id,
      lotNumber: 'L-PARA-001',
      quantityPhysical: 100,
      quantityAvailable: 100,
      quantityReserved: 0,
      expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      manufacturingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      supplier: 'Medquímica',
    },
  });

  // Lote 2: Vence em 90 dias
  const lotPara2 = await prisma.medicationLot.create({
    data: {
      ubsId: ubsCentro.id,
      medicationId: medParacetamol.id,
      lotNumber: 'L-PARA-002',
      quantityPhysical: 150,
      quantityAvailable: 150,
      quantityReserved: 0,
      expirationDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      manufacturingDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      supplier: 'EMS',
    },
  });

  // Amoxicilina na UBS Centro (Abaixo do estoque mínimo: 5 unidades disponíveis)
  const lotAmox = await prisma.medicationLot.create({
    data: {
      ubsId: ubsCentro.id,
      medicationId: medAmoxicilina.id,
      lotNumber: 'L-AMOX-001',
      quantityPhysical: 5,
      quantityAvailable: 5,
      quantityReserved: 0,
      expirationDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      supplier: 'Eurofarma',
    },
  });

  // Ibuprofeno na UBS Paulista
  // Lote 1: VENCIDO!
  const lotIbuVencido = await prisma.medicationLot.create({
    data: {
      ubsId: ubsPaulista.id,
      medicationId: medIbuprofeno.id,
      lotNumber: 'L-IBU-VENCIDO',
      quantityPhysical: 30,
      quantityAvailable: 30,
      quantityReserved: 0,
      expirationDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Venceu há 5 dias
      supplier: 'Neo Química',
    },
  });

  // Lote 2: Vence em 45 dias
  const lotIbuOk = await prisma.medicationLot.create({
    data: {
      ubsId: ubsPaulista.id,
      medicationId: medIbuprofeno.id,
      lotNumber: 'L-IBU-OK',
      quantityPhysical: 80,
      quantityAvailable: 80,
      quantityReserved: 0,
      expirationDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      supplier: 'EMS',
    },
  });

  // 13. Agregar tabelas de Inventory (Estoque por UBS)
  await prisma.inventory.create({
    data: { ubsId: ubsCentro.id, medicationId: medParacetamol.id, quantity: 250 },
  });
  await prisma.inventory.create({
    data: { ubsId: ubsCentro.id, medicationId: medAmoxicilina.id, quantity: 5 },
  });
  await prisma.inventory.create({
    data: { ubsId: ubsPaulista.id, medicationId: medIbuprofeno.id, quantity: 80 }, // lotes ativos apenas
  });

  // Gravar movimentos iniciais de entrada
  await prisma.inventoryMovement.create({
    data: { medicationId: medParacetamol.id, lotId: lotPara1.id, ubsId: ubsCentro.id, quantity: 100, type: 'INPUT', userId: adminUser.id, remarks: 'Carga inicial' },
  });
  await prisma.inventoryMovement.create({
    data: { medicationId: medParacetamol.id, lotId: lotPara2.id, ubsId: ubsCentro.id, quantity: 150, type: 'INPUT', userId: adminUser.id, remarks: 'Carga inicial' },
  });
  await prisma.inventoryMovement.create({
    data: { medicationId: medAmoxicilina.id, lotId: lotAmox.id, ubsId: ubsCentro.id, quantity: 5, type: 'INPUT', userId: adminUser.id, remarks: 'Carga inicial' },
  });
  await prisma.inventoryMovement.create({
    data: { medicationId: medIbuprofeno.id, lotId: lotIbuVencido.id, ubsId: ubsPaulista.id, quantity: 30, type: 'INPUT', userId: adminUser.id, remarks: 'Carga inicial' },
  });
  await prisma.inventoryMovement.create({
    data: { medicationId: medIbuprofeno.id, lotId: lotIbuOk.id, ubsId: ubsPaulista.id, quantity: 80, type: 'INPUT', userId: adminUser.id, remarks: 'Carga inicial' },
  });

  console.log('Semeadura do banco de dados concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
