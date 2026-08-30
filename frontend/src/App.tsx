import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  User,
  Users,
  LogOut,
  MapPin,
  AlertTriangle,
  FileBadge,
  Package,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle,
  BriefcaseMedical,
  BarChart3,
  Search,
  Check,
  Building2
} from 'lucide-react';
import { api } from './api';

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ubs_token'));
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('ubs_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState<string>('home');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auth State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regBirth, setRegBirth] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regNum, setRegNum] = useState('');
  const [regComp, setRegComp] = useState('');
  const [regNeigh, setRegNeigh] = useState('');
  const regCity = 'São Paulo';
  const regState = 'SP';
  const [regZip, setRegZip] = useState('');

  // Loaded Data
  const [ubsList, setUbsList] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [expiringLots, setExpiringLots] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [kpiStats, setKpiStats] = useState<any>(null);

  // Search/Filters
  const [patientSearch, setPatientSearch] = useState('');
  const [patientList, setPatientList] = useState<any[]>([]);
  const [selectedUbsId, setSelectedUbsId] = useState('');

  // Active Action states
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [evolution, setEvolution] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [conduct, setConduct] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [medQty, setMedQty] = useState(1);
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [medDur, setMedDur] = useState('');
  const [prescribedItems, setPrescribedItems] = useState<any[]>([]);
  const [examsRequestList, setExamsRequestList] = useState<{ examName: string }[]>([]);
  const [newExamName, setNewExamName] = useState('');

  // Scheduling states
  const [schedSpecId, setSchedSpecId] = useState('');
  const [schedDocId, setSchedDocId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [routingInfo, setRoutingInfo] = useState<any>(null);

  // Pharmacy states
  const [pharmMedId, setPharmMedId] = useState('');
  const [pharmLot, setPharmLot] = useState('');
  const [pharmQty, setPharmQty] = useState(0);
  const [pharmExp, setPharmExp] = useState('');
  const [pharmMfg, setPharmMfg] = useState('');
  const [pharmSupplier, setPharmSupplier] = useState('');
  const [dispenseReservations, setDispenseReservations] = useState<any[]>([]);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  
  // Adjust stock states
  const [adjustMedId, setAdjustMedId] = useState('');
  const [adjustLotId, setAdjustLotId] = useState('');
  const [adjustLotList, setAdjustLotList] = useState<any[]>([]);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'LOSS' | 'RETURN'>('LOSS');
  const [adjustRemarks, setAdjustRemarks] = useState('');

  // Admin states
  const [newUbsName, setNewUbsName] = useState('');
  const [newUbsCode, setNewUbsCode] = useState('');
  const [newUbsPhone, setNewUbsPhone] = useState('');
  const [newUbsEmail, setNewUbsEmail] = useState('');
  const [newUbsStreet, setNewUbsStreet] = useState('');
  const [newUbsNum, setNewUbsNum] = useState('');
  const [newUbsNeigh, setNewUbsNeigh] = useState('');
  const [newUbsZip, setNewUbsZip] = useState('');
  const [newUbsLat, setNewUbsLat] = useState(-23.55);
  const [newUbsLng, setNewUbsLng] = useState(-46.63);
  
  const [newZoneUbsId, setNewZoneUbsId] = useState('');
  const [newZoneName, setNewZoneName] = useState('');

  // Internal User Creation
  const [intName, setIntName] = useState('');
  const [intEmail, setIntEmail] = useState('');
  const [intPassword, setIntPassword] = useState('');
  const [intRole, setIntRole] = useState('ATENDENTE');
  const [intCpf, setIntCpf] = useState('');
  const [intCrm, setIntCrm] = useState('');
  const [intSpecIds, setIntSpecIds] = useState<string[]>([]);
  const [intUbsIds, setIntUbsIds] = useState<string[]>([]);

  // Referral states
  const [refDestUbsId, setRefDestUbsId] = useState('');
  const [refSpecId, setRefSpecId] = useState('');
  const [refReason, setRefReason] = useState('');



  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const loadPharmacyData = useCallback(async (ubsId: string) => {
    try {
      const inv = await api.pharmacy.getInventory(ubsId);
      setInventoryList(inv);

      const alerts = await api.pharmacy.getAlerts(ubsId);
      setInventoryAlerts(alerts);

      const expiring = await api.pharmacy.getExpiring(ubsId);
      setExpiringLots(expiring);
    } catch (err: any) {
      showError(err.message);
    }
  }, []);

  const fetchGlobalData = useCallback(async () => {
    try {
      const ubsData = await api.ubs.getAll();
      setUbsList(ubsData);

      const specs = await api.ubs.getSpecialties();
      setSpecialties(specs);

      const docs = await api.doctors.getAll();
      setDoctors(docs);

      const meds = await api.pharmacy.getMedications();
      setMedications(meds);

      if (user?.role === 'PACIENTE') {
        const historyData = await api.medicalRecords.getHistory(user.patientId);
        setHistory(historyData);
        
        const myApps = await api.appointments.getAll({ patientId: user.patientId });
        setAppointments(myApps);

        const refData = await api.medicalRecords.getReferrals({ patientId: user.patientId });
        setReferrals(refData);
      }

      if (user?.role === 'MEDICO') {
        const apps = await api.appointments.getAll({ doctorId: user.doctorId });
        setAppointments(apps);
      }

      if (['ADMINISTRADOR', 'GESTOR', 'FARMACEUTICO', 'ATENDENTE'].includes(user?.role)) {
        const apps = await api.appointments.getAll();
        setAppointments(apps);
      }

      if (user?.role === 'GESTOR' || user?.role === 'ADMINISTRADOR') {
        const stats = await api.reports.getDashboard();
        setKpiStats(stats);
      }

      if (user?.role === 'FARMACEUTICO') {
        // Load default UBS stock if linked or select first
        if (ubsData.length > 0) {
          const defaultUbsId = ubsData[0].id;
          setSelectedUbsId(defaultUbsId);
          loadPharmacyData(defaultUbsId);
        }
      }
    } catch (err: any) {
      showError(err.message);
    }
  }, [user, loadPharmacyData]);

  // Fetch initial generic data on login
  useEffect(() => {
    if (token) {
      fetchGlobalData();
    }
  }, [token, fetchGlobalData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      localStorage.setItem('ubs_token', res.access_token);
      localStorage.setItem('ubs_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
      setView('home');
      showSuccess('Login realizado com sucesso!');
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleQuickLogin = async (role: string) => {
    let email = '';
    let pass = '';
    switch (role) {
      case 'ADMINISTRADOR':
        email = 'admin@ubs.com';
        pass = 'admin123';
        break;
      case 'GESTOR':
        email = 'gestor@ubs.com';
        pass = 'gestor123';
        break;
      case 'MEDICO':
        email = 'medico@ubs.com';
        pass = 'medico123';
        break;
      case 'ATENDENTE':
        email = 'atendente@ubs.com';
        pass = 'atendente123';
        break;
      case 'FARMACEUTICO':
        email = 'farmaceutico@ubs.com';
        pass = 'farmaceutico123';
        break;
      case 'PACIENTE':
        email = 'paciente@ubs.com';
        pass = 'paciente123';
        break;
    }
    try {
      const res = await api.auth.login(email, pass);
      localStorage.setItem('ubs_token', res.access_token);
      localStorage.setItem('ubs_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
      setView('home');
      showSuccess(`Logado como ${res.user.name}`);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ubs_token');
    localStorage.removeItem('ubs_user');
    setToken(null);
    setUser(null);
    setView('home');
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        email: regEmail,
        passwordHash: regPassword,
        name: regName,
        cpf: regCpf,
        birthDate: regBirth,
        phone: regPhone,
        address: {
          street: regStreet,
          number: regNum,
          complement: regComp,
          neighborhood: regNeigh,
          city: regCity,
          state: regState,
          zipCode: regZip,
        },
      };
      await api.auth.registerPatient(data);
      showSuccess('Cadastro realizado! Por favor faça o login.');
      setIsRegistering(false);
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Patient Booking Flow
  const handleBookingSpecChange = async (specId: string) => {
    setSchedSpecId(specId);
    setSchedDocId('');
    setSchedDate('');
    setAvailableSlots([]);

    // 1. Get Patient Details to determine reference UBS
    try {
      const patientDetails = await api.patients.getMe();
      const refUbs = patientDetails.routingUbs;

      if (!refUbs) {
        setRoutingInfo({ status: 'NO_UBS', message: 'Nenhuma UBS de referência associada ao seu bairro.' });
        return;
      }

      // Check if reference UBS has the specialty
      const hasSpecialty = refUbs.specialties?.some((s: any) => s.specialtyId === specId);

      if (hasSpecialty) {
        setRoutingInfo({
          status: 'LOCAL',
          ubs: refUbs,
          message: `Consulta será agendada na sua unidade de referência: ${refUbs.name}.`,
        });
        // Load doctors for this specialty in this UBS
        const filteredDocs = await api.doctors.getAll({ ubsId: refUbs.id, specialtyId: specId });
        setDoctors(filteredDocs);
      } else {
        // Find alternative UBS (Central)
        const centralUbs = ubsList.find((u) => u.name.toLowerCase().includes('central') || u.name.toLowerCase().includes('centro') || u.code === 'UBS-001');
        if (centralUbs) {
          setRoutingInfo({
            status: 'ROUTED',
            ubs: centralUbs,
            message: `Sua unidade de referência (${refUbs.name}) não oferece esta especialidade. Você foi encaminhado para a ${centralUbs.name}.`,
          });
          const filteredDocs = await api.doctors.getAll({ ubsId: centralUbs.id, specialtyId: specId });
          setDoctors(filteredDocs);
        } else {
          // If no central found, search any UBS containing specialty
          const alternativeUbs = ubsList.find((u) => u.specialties?.some((s: any) => s.specialtyId === specId));
          if (alternativeUbs) {
            setRoutingInfo({
              status: 'ROUTED',
              ubs: alternativeUbs,
              message: `Sua unidade de referência (${refUbs.name}) não oferece esta especialidade. Você foi encaminhado para a ${alternativeUbs.name}.`,
            });
            const filteredDocs = await api.doctors.getAll({ ubsId: alternativeUbs.id, specialtyId: specId });
            setDoctors(filteredDocs);
          } else {
            setRoutingInfo({
              status: 'UNAVAILABLE',
              message: 'Esta especialidade não está disponível em nenhuma UBS da rede no momento.',
            });
          }
        }
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBookingDoctorChange = async (docId: string) => {
    setSchedDocId(docId);
    setSchedDate('');
    setAvailableSlots([]);
  };

  const handleBookingDateChange = async (date: string) => {
    setSchedDate(date);
    setAvailableSlots([]);
    if (!schedDocId || !schedSpecId) return;

    try {
      const slots = await api.appointments.getSlots(schedDocId, date, schedSpecId);
      setAvailableSlots(slots);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleConfirmBooking = async () => {
    if (!routingInfo?.ubs || !schedDocId || !schedSpecId || !schedDate || !schedTime) {
      showError('Por favor selecione todos os campos.');
      return;
    }

    try {
      const dateTimeStr = `${schedDate}T${schedTime}:00`;
      await api.appointments.create({
        patientId: user.patientId,
        doctorId: schedDocId,
        specialtyId: schedSpecId,
        ubsId: routingInfo.ubs.id,
        dateTime: dateTimeStr,
      });

      showSuccess('Consulta agendada com sucesso!');
      setView('appointments');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleCancelAppointment = async (appId: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await api.appointments.updateStatus(appId, 'CANCELADA');
      showSuccess('Consulta cancelada.');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Doctor Flow
  const handleStartAttendance = async (app: any) => {
    try {
      await api.appointments.updateStatus(app.id, 'EM_ATENDIMENTO');
      setActiveAppointment(app);
      setView('doctor-attendance');
      setEvolution('');
      setDiagnosis('');
      setConduct('');
      setPrescribedItems([]);
      setExamsRequestList([]);
      setRefDestUbsId('');
      setRefSpecId('');
      setRefReason('');
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleAddMedicationToPrescription = () => {
    if (!selectedMedId || !medDosage || !medFreq || !medDur || medQty <= 0) {
      showError('Preencha os dados do medicamento.');
      return;
    }

    const medicationObj = medications.find((m) => m.id === selectedMedId);
    setPrescribedItems([
      ...prescribedItems,
      {
        medicationId: selectedMedId,
        medicationName: medicationObj ? medicationObj.name : '',
        dosage: medDosage,
        frequency: medFreq,
        duration: medDur,
        qtyRequested: Number(medQty),
      },
    ]);

    setSelectedMedId('');
    setMedDosage('');
    setMedFreq('');
    setMedDur('');
    setMedQty(1);
  };

  const handleRemovePrescribedItem = (index: number) => {
    setPrescribedItems(prescribedItems.filter((_, idx) => idx !== index));
  };

  const handleAddExamToRequest = () => {
    if (!newExamName.trim()) return;
    setExamsRequestList([...examsRequestList, { examName: newExamName.trim() }]);
    setNewExamName('');
  };

  const handleRemoveExamItem = (index: number) => {
    setExamsRequestList(examsRequestList.filter((_, idx) => idx !== index));
  };

  const handleSaveAttendance = async () => {
    if (!evolution || !diagnosis || !conduct) {
      showError('Evolução, Diagnóstico e Conduta são obrigatórios.');
      return;
    }

    try {
      const payload: any = {
        appointmentId: activeAppointment.id,
        evolution,
        diagnosis,
        conduct,
      };

      if (prescribedItems.length > 0) {
        payload.prescriptions = prescribedItems;
      }

      if (examsRequestList.length > 0) {
        payload.examRequests = examsRequestList;
      }

      if (refDestUbsId && refSpecId && refReason) {
        payload.referral = {
          destinationUbsId: refDestUbsId,
          specialtyId: refSpecId,
          reason: refReason,
        };
      }

      await api.medicalRecords.createAttendance(payload);
      showSuccess('Atendimento finalizado com sucesso!');
      setActiveAppointment(null);
      setView('home');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Pharmacist Flow
  const handleLoadPrescriptionItems = async (appId: string) => {
    try {
      const record = await api.medicalRecords.getAttendance(appId);
      if (record.prescription) {
        setDispenseReservations(record.prescription.items);
      } else {
        setDispenseReservations([]);
        showError('Esta consulta não possui receitas associadas.');
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDispenseItem = async (itemId: string) => {
    try {
      const res = await api.pharmacy.dispense(itemId);
      showSuccess(`Medicamento dispensado com sucesso! Quantidade: ${res.quantityDispensed}`);
      if (selectedUbsId) loadPharmacyData(selectedUbsId);
      // Refresh items list
      if (activeAppointment) {
        handleLoadPrescriptionItems(activeAppointment.id);
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleAddStockLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmMedId || !pharmLot || pharmQty <= 0 || !pharmExp || !selectedUbsId) {
      showError('Preencha os dados do lote.');
      return;
    }

    try {
      await api.pharmacy.addLot({
        medicationId: pharmMedId,
        lotNumber: pharmLot,
        quantityPhysical: Number(pharmQty),
        expirationDate: pharmExp,
        manufacturingDate: pharmMfg || undefined,
        supplier: pharmSupplier || undefined,
        ubsId: selectedUbsId,
      });

      showSuccess('Estoque adicionado com sucesso!');
      setPharmLot('');
      setPharmQty(0);
      setPharmExp('');
      setPharmMfg('');
      setPharmSupplier('');
      loadPharmacyData(selectedUbsId);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleSelectMedicationForAdjust = async (medId: string) => {
    setAdjustMedId(medId);
    setAdjustLotId('');
    if (!selectedUbsId) return;

    try {
      const lots = await api.pharmacy.getLotsList(selectedUbsId, medId);
      setAdjustLotList(lots);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMedId || !adjustLotId || !selectedUbsId || adjustQty === 0) {
      showError('Todos os campos são obrigatórios.');
      return;
    }

    // Force sign constraints
    let qty = Number(adjustQty);
    if (adjustType === 'LOSS' && qty > 0) qty = -qty;
    if (adjustType === 'RETURN' && qty < 0) qty = -qty;

    try {
      await api.pharmacy.adjust({
        medicationId: adjustMedId,
        lotId: adjustLotId,
        ubsId: selectedUbsId,
        quantity: qty,
        type: adjustType,
        remarks: adjustRemarks,
      });

      showSuccess('Estoque ajustado com sucesso!');
      setAdjustLotId('');
      setAdjustQty(0);
      setAdjustRemarks('');
      loadPharmacyData(selectedUbsId);
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Atendente Flow
  const handleAtendentePatientLookup = async () => {
    try {
      const list = await api.patients.getAll(patientSearch);
      setPatientList(list);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleRegisterPatientOperational = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: regName,
        cpf: regCpf,
        birthDate: regBirth,
        phone: regPhone,
        email: regEmail || `${regCpf.replace(/\D/g, '')}@example.com`,
        address: {
          street: regStreet,
          number: regNum,
          complement: regComp,
          neighborhood: regNeigh,
          city: regCity,
          state: regState,
          zipCode: regZip,
        },
      };

      const pat = await api.patients.createOperational(data);
      showSuccess(`Paciente cadastrado operacionalmente! UBS de referência determinada: ${pat.routingUbsId ? 'Sim' : 'Padrão'}`);
      setRegName('');
      setRegCpf('');
      setRegBirth('');
      setRegPhone('');
      setRegEmail('');
      setRegStreet('');
      setRegNum('');
      setRegComp('');
      setRegNeigh('');
      setRegZip('');
      setView('atendente-patients');
      handleAtendentePatientLookup();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleCheckInPatient = async (appId: string) => {
    try {
      await api.appointments.updateStatus(appId, 'PACIENTE_CHEGOU');
      showSuccess('Chegada registrada! Consulta pronta para o atendimento médico.');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleConfirmPresence = async (appId: string) => {
    try {
      await api.appointments.updateStatus(appId, 'CONFIRMADA');
      showSuccess('Consulta confirmada.');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Admin Flow
  const handleCreateUbs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.ubs.create({
        name: newUbsName,
        code: newUbsCode,
        phone: newUbsPhone,
        email: newUbsEmail,
        latitude: Number(newUbsLat),
        longitude: Number(newUbsLng),
        address: {
          street: newUbsStreet,
          number: newUbsNum,
          neighborhood: newUbsNeigh,
          city: 'São Paulo',
          state: 'SP',
          zipCode: newUbsZip,
        },
      });

      showSuccess('UBS criada com sucesso!');
      setNewUbsName('');
      setNewUbsCode('');
      setNewUbsPhone('');
      setNewUbsEmail('');
      setNewUbsStreet('');
      setNewUbsNum('');
      setNewUbsNeigh('');
      setNewUbsZip('');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneUbsId || !newZoneName) return;

    try {
      await api.ubs.addZone(newZoneUbsId, newZoneName);
      showSuccess('Zona de atendimento adicionada!');
      setNewZoneName('');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleRemoveZone = async (zoneId: string) => {
    if (!confirm('Deseja realmente remover esta zona?')) return;
    try {
      await api.ubs.removeZone(zoneId);
      showSuccess('Zona de atendimento removida.');
      fetchGlobalData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleCreateInternalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: intName,
        email: intEmail,
        passwordHash: intPassword,
        role: intRole,
      };

      if (intRole === 'MEDICO') {
        payload.doctorDetails = {
          cpf: intCpf,
          crm: intCrm,
          specialtyIds: intSpecIds,
          ubsIds: intUbsIds,
        };
      }

      await api.auth.createInternalUser(payload);
      showSuccess('Usuário interno cadastrado!');
      setIntName('');
      setIntEmail('');
      setIntPassword('');
      setIntCpf('');
      setIntCrm('');
      setIntSpecIds([]);
      setIntUbsIds([]);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const toggleIntSpec = (specId: string) => {
    if (intSpecIds.includes(specId)) {
      setIntSpecIds(intSpecIds.filter((id) => id !== specId));
    } else {
      setIntSpecIds([...intSpecIds, specId]);
    }
  };

  const toggleIntUbs = (ubsId: string) => {
    if (intUbsIds.includes(ubsId)) {
      setIntUbsIds(intUbsIds.filter((id) => id !== ubsId));
    } else {
      setIntUbsIds([...intUbsIds, ubsId]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast notifications */}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-rose-500/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-xl border border-rose-400 flex items-center gap-2 max-w-md animate-bounce">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium text-sm">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-400 flex items-center gap-2 max-w-md">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Main Layout */}
      {!token ? (
        // Auth Layout
        <div className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]">
          {/* Decorative gradients */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Hero Header */}
          <div className="text-center mb-8 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-500/20 mb-4">
              <Activity className="h-4 w-4" /> Gestão Pública de Saúde
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Sistema <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">UBS Integrado</span>
            </h1>
            <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
              Plataforma unificada para gerenciamento de zoneamento, prontuários, agendamentos e controle inteligente de farmácia por lote.
            </p>
          </div>

          {/* Quick Logins Panel for Testing */}
          <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 mb-8 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Painel de Acesso Rápido (Ambiente de Testes)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { r: 'ADMINISTRADOR', label: 'Admin', desc: 'UBSs, Especialid. & Usuários' },
                { r: 'GESTOR', label: 'Gestor', desc: 'KPIs, Estoque & Consumo' },
                { r: 'MEDICO', label: 'Médico', desc: 'Agenda, Prontuários & Receitas' },
                { r: 'ATENDENTE', label: 'Atendente', desc: 'Triage, Recepção & Cadastro' },
                { r: 'FARMACEUTICO', label: 'Farmacêutico', desc: 'Lotes, Validade & Dispensação' },
                { r: 'PACIENTE', label: 'Paciente', desc: 'Auto-Agendamento & Receitas' },
              ].map((item) => (
                <button
                  key={item.r}
                  onClick={() => handleQuickLogin(item.r)}
                  className="bg-slate-800/80 hover:bg-indigo-600/90 border border-slate-700 hover:border-indigo-400 text-slate-200 hover:text-white px-3 py-2.5 rounded-xl transition duration-300 flex flex-col items-center text-center shadow-lg group relative overflow-hidden"
                >
                  <span className="font-bold text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-200 mt-1 line-clamp-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Credentials login form */}
          <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-850 p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {!isRegistering ? (
              // Login form
              <form onSubmit={handleLogin} className="space-y-5">
                <h3 className="text-xl font-bold text-white text-center mb-6">Entrar com credenciais</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-mail</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="exemplo@ubs.com"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Senha</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl py-3.5 text-sm font-semibold shadow-lg shadow-indigo-650/30 transition duration-300"
                >
                  Fazer Login
                </button>
                <div className="text-center mt-4">
                  <span className="text-xs text-slate-400">
                    Paciente novo?{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Cadastre-se aqui
                    </button>
                  </span>
                </div>
              </form>
            ) : (
              // Registration form
              <form onSubmit={handleRegisterPatient} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                <h3 className="text-xl font-bold text-white text-center mb-4">Auto-Cadastro de Paciente</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">CPF</label>
                      <input
                        type="text"
                        required
                        value={regCpf}
                        onChange={(e) => setRegCpf(e.target.value)}
                        placeholder="111.111.111-11"
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nascimento</label>
                      <input
                        type="date"
                        required
                        value={regBirth}
                        onChange={(e) => setRegBirth(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="email@dominio.com"
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Telefone</label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="(11) 99999-8888"
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Senha de Acesso</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                    />
                  </div>

                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider pt-2 border-t border-slate-800">
                    Endereço (Define a UBS de Referência)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rua</label>
                      <input
                        type="text"
                        required
                        value={regStreet}
                        onChange={(e) => setRegStreet(e.target.value)}
                        placeholder="Ex: Rua Augusta"
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Número</label>
                      <input
                        type="text"
                        required
                        value={regNum}
                        onChange={(e) => setRegNum(e.target.value)}
                        placeholder="100"
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Bairro (Zoneamento)</label>
                      <select
                        required
                        value={regNeigh}
                        onChange={(e) => setRegNeigh(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition text-slate-400"
                      >
                        <option value="">Selecione...</option>
                        <option value="Centro">Centro (Referência: UBS Centro)</option>
                        <option value="Bela Vista">Bela Vista (Referência: UBS Centro)</option>
                        <option value="Jardim Paulista">Jardim Paulista (Referência: UBS Paulista)</option>
                        <option value="Consolação">Consolação (Referência: UBS Paulista)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">CEP</label>
                      <input
                        type="text"
                        required
                        value={regZip}
                        onChange={(e) => setRegZip(e.target.value)}
                        placeholder="01300-000"
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-semibold transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-semibold transition"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        // Main App Layout
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-sm leading-tight uppercase tracking-wider">UBS Saúde</h2>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{user?.role}</span>
              </div>
            </div>

            {/* User Info Badge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-650/40 rounded-full flex items-center justify-center font-bold text-indigo-300">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-xs text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Navigation links based on Role */}
            <nav className="flex-1 flex flex-col gap-1.5">
              {user.role === 'PACIENTE' && (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'home' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <User className="h-4.5 w-4.5" /> Início
                  </button>
                  <button
                    onClick={() => { setView('patient-book'); setSchedSpecId(''); setRoutingInfo(null); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'patient-book' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <Calendar className="h-4.5 w-4.5" /> Agendar Consulta
                  </button>
                  <button
                    onClick={() => setView('appointments')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'appointments' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <ClipboardList className="h-4.5 w-4.5" /> Minhas Consultas
                  </button>
                  <button
                    onClick={() => setView('patient-history')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'patient-history' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <FileText className="h-4.5 w-4.5" /> Prontuários & Receitas
                  </button>
                  <button
                    onClick={() => setView('patient-referrals')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'patient-referrals' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <FileBadge className="h-4.5 w-4.5" /> Encaminhamentos
                  </button>
                </>
              )}

              {user.role === 'MEDICO' && (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'home' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <ClipboardList className="h-4.5 w-4.5" /> Minha Agenda
                  </button>
                </>
              )}

              {user.role === 'ATENDENTE' && (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'home' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <Calendar className="h-4.5 w-4.5" /> Recepção / Agenda
                  </button>
                  <button
                    onClick={() => { setView('atendente-patients'); handleAtendentePatientLookup(); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'atendente-patients' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <Users className="h-4.5 w-4.5" /> Cadastrar / Buscar Pacientes
                  </button>
                </>
              )}

              {user.role === 'FARMACEUTICO' && (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'home' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <Package className="h-4.5 w-4.5" /> Dispensação & Receitas
                  </button>
                  <button
                    onClick={() => setView('pharmacy-inventory')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'pharmacy-inventory' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <BriefcaseMedical className="h-4.5 w-4.5" /> Entrada de Lotes / Ajustes
                  </button>
                </>
              )}

              {user.role === 'GESTOR' && (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'home' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <BarChart3 className="h-4.5 w-4.5" /> Dashboard Gerencial
                  </button>
                </>
              )}

              {user.role === 'ADMINISTRADOR' && (
                <>
                  <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'home' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <BarChart3 className="h-4.5 w-4.5" /> Dashboard Geral
                  </button>
                  <button
                    onClick={() => setView('admin-ubs')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'admin-ubs' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <Building2 className="h-4.5 w-4.5" /> UBSs & Zonas
                  </button>
                  <button
                    onClick={() => setView('admin-users')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${view === 'admin-users' ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    <Users className="h-4.5 w-4.5" /> Usuários Internos
                  </button>
                </>
              )}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition mt-auto"
            >
              <LogOut className="h-4.5 w-4.5" /> Desconectar
            </button>
          </aside>

          {/* Main Area */}
          <main className="flex-1 bg-slate-950 p-6 sm:p-8 overflow-y-auto max-h-screen">
            {/* -------------------- PACIENTE HOME -------------------- */}
            {user.role === 'PACIENTE' && view === 'home' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <h2 className="text-2xl font-bold text-white">Olá, {user.name}!</h2>
                  <p className="text-slate-400 text-sm mt-1">Bem-vindo ao seu Portal do Paciente. Consulte e agende consultas na rede UBS.</p>
                  
                  {appointments.filter(a => ['AGENDADA', 'CONFIRMADA'].includes(a.status)).length > 0 ? (
                    <div className="mt-6 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl max-w-md">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Próxima Consulta</span>
                        <span className="bg-indigo-500/15 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Agendada</span>
                      </div>
                      {(() => {
                        const next = appointments.filter(a => ['AGENDADA', 'CONFIRMADA'].includes(a.status))[0];
                        return (
                          <div className="space-y-2.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Especialidade:</span>
                              <span className="font-semibold text-white">{next.specialty.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Médico:</span>
                              <span className="font-semibold text-white">{next.doctor.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">UBS:</span>
                              <span className="font-semibold text-white">{next.ubs.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Data / Hora:</span>
                              <span className="font-semibold text-indigo-300">
                                {new Date(next.dateTime).toLocaleDateString()} às {new Date(next.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="mt-4 text-xs font-semibold text-slate-400">Você não possui consultas agendadas.</p>
                  )}
                </div>

                {/* Patient overview cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade de Saúde de Referência</h4>
                      <p className="text-sm font-semibold text-white mt-1">
                        {appointments.length > 0 ? appointments[0].patient?.routingUbs?.name || 'UBS Paulista' : 'UBS Paulista'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Definida pelo seu endereço (Zoneamento de bairros)</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultas no Histórico</h4>
                      <p className="text-lg font-bold text-white mt-1">{appointments.length}</p>
                      <button onClick={() => setView('patient-history')} className="text-xs text-indigo-400 hover:underline mt-1 font-semibold flex items-center gap-1">
                        Ver histórico <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- PATIENT BOOKING VIEW -------------------- */}
            {user.role === 'PACIENTE' && view === 'patient-book' && (
              <div className="space-y-6 max-w-3xl">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-400" /> Agendar Consulta Inteligente
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">O sistema roteia automaticamente sua solicitação para a UBS adequada conforme zoneamento.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-6">
                  {/* Select Specialty */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Selecione a Especialidade</label>
                    <select
                      value={schedSpecId}
                      onChange={(e) => handleBookingSpecChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Selecione...</option>
                      {specialties.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Routing information */}
                  {routingInfo && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${routingInfo.status === 'LOCAL' ? 'bg-indigo-500/5 border-indigo-550/20 text-indigo-300' : routingInfo.status === 'ROUTED' ? 'bg-amber-500/5 border-amber-550/20 text-amber-300' : 'bg-rose-500/5 border-rose-550/20 text-rose-300'}`}>
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <div>
                        <span className="font-semibold text-xs uppercase tracking-wider">Zoneamento Inteligente</span>
                        <p className="text-xs mt-1 leading-relaxed">{routingInfo.message}</p>
                      </div>
                    </div>
                  )}

                  {routingInfo?.ubs && (
                    <>
                      {/* Select Doctor */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Selecione o Médico Disponível</label>
                        <select
                          value={schedDocId}
                          onChange={(e) => handleBookingDoctorChange(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Selecione...</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      {schedDocId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Date Picker */}
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. Escolha a Data</label>
                            <input
                              type="date"
                              value={schedDate}
                              onChange={(e) => handleBookingDateChange(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Time Picker Slots */}
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">4. Horários Disponíveis</label>
                            {availableSlots.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSchedTime(slot)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${schedTime === slot ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 hover:border-indigo-550 text-slate-350'}`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 py-3 italic">Nenhum horário disponível para esta data.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {schedTime && (
                    <button
                      onClick={handleConfirmBooking}
                      className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
                    >
                      Confirmar Agendamento de Consulta
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- PATIENT APPOINTMENTS LIST -------------------- */}
            {user.role === 'PACIENTE' && view === 'appointments' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Minhas Consultas Agendadas</h2>
                  <p className="text-slate-400 text-xs mt-1">Acompanhe suas consultas agendadas e compareça no horário determinado.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointments.map((app) => (
                    <div key={app.id} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${app.status === 'AGENDADA' || app.status === 'CONFIRMADA' ? 'bg-indigo-500/10 text-indigo-300' : app.status === 'ATENDIDA' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-350'}`}>
                            {app.status}
                          </span>
                          <span className="text-[10px] text-slate-500">{new Date(app.dateTime).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{app.specialty.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">Médico: <span className="text-slate-300 font-semibold">{app.doctor.name}</span></p>
                        <p className="text-xs text-slate-400">Local: <span className="text-slate-300 font-semibold">{app.ubs.name}</span></p>
                        <p className="text-xs text-slate-400">Horário: <span className="text-indigo-350 font-bold">{new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
                      </div>

                      {['AGENDADA', 'CONFIRMADA'].includes(app.status) && (
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-850">
                          <button
                            onClick={() => handleCancelAppointment(app.id)}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Cancelar Consulta
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {appointments.length === 0 && (
                    <div className="col-span-2 text-center py-12 border border-dashed border-slate-850 rounded-2xl">
                      <Calendar className="h-10 w-10 text-slate-650 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Nenhum agendamento encontrado.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- PATIENT HISTORIC/PRESCRIPTIONS -------------------- */}
            {user.role === 'PACIENTE' && view === 'patient-history' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Seu Prontuário e Receitas Médicas</h2>
                  <p className="text-slate-400 text-xs mt-1">Histórico completo de atendimentos, receitas emitidas e exames solicitados.</p>
                </div>

                <div className="space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
                      {/* Appointment Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-3 gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white">Consulta de {record.appointment.specialty.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Médico: {record.appointment.doctor.name} | Local: {record.appointment.ubs.name}</p>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Diagnostic details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Anamnese / Evolução</span>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">{record.evolution}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Diagnóstico</span>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">{record.diagnosis}</p>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase">Conduta</span>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">{record.conduct}</p>
                        </div>
                      </div>

                      {/* Prescriptions */}
                      {record.prescription && record.prescription.items.length > 0 && (
                        <div className="border-t border-slate-850 pt-3">
                          <h5 className="text-xs font-bold text-indigo-400 uppercase mb-2">Receita Médica Emitida</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {record.prescription.items.map((item: any) => (
                              <div key={item.id} className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl">
                                <p className="font-bold text-xs text-white">{item.medication.name}</p>
                                <div className="text-[10px] text-slate-450 mt-1 grid grid-cols-3 gap-1">
                                  <span>Dosagem: {item.dosage}</span>
                                  <span>Freq: {item.frequency}</span>
                                  <span>Duração: {item.duration}</span>
                                </div>
                                <div className="mt-2 text-[10px] font-semibold text-indigo-300">
                                  Qtd Prescrita: {item.qtyRequested} | Dispensado: {item.qtyDispensed}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exam requests */}
                      {record.examRequest && record.examRequest.items.length > 0 && (
                        <div className="border-t border-slate-850 pt-3">
                          <h5 className="text-xs font-bold text-indigo-400 uppercase mb-2">Solicitações de Exames</h5>
                          <div className="flex flex-wrap gap-2">
                            {record.examRequest.items.map((item: any) => (
                              <span key={item.id} className="bg-slate-950 border border-slate-850 text-xs px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                {item.examName} ({item.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {history.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl">
                      <FileText className="h-10 w-10 text-slate-650 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Você não possui registros de prontuários no seu histórico.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- PATIENT REFERRALS LIST -------------------- */}
            {user.role === 'PACIENTE' && view === 'patient-referrals' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Seus Encaminhamentos Ativos</h2>
                  <p className="text-slate-400 text-xs mt-1">Veja encaminhamentos criados pelos médicos para especialidades em outras unidades de saúde.</p>
                </div>

                <div className="space-y-3">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-white">Encaminhamento de {ref.specialty.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">Origem: <span className="text-slate-350">{ref.originUbs.name}</span> | Destino: <span className="text-indigo-350 font-bold">{ref.destinationUbs.name}</span></p>
                        <p className="text-xs text-slate-450 mt-0.5">Motivo: {ref.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full uppercase">
                        Autorizado
                      </span>
                    </div>
                  ))}

                  {referrals.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl">
                      <FileBadge className="h-10 w-10 text-slate-650 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Nenhum encaminhamento encontrado.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- DOCTOR AGENDA / SCHEDULE -------------------- */}
            {user.role === 'MEDICO' && view === 'home' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Sua Agenda de Atendimentos</h2>
                  <p className="text-slate-400 text-xs mt-1">Consulte seus pacientes agendados para hoje e inicie as consultas médicas.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="p-4">Horário</th>
                          <th className="p-4">Paciente</th>
                          <th className="p-4">UBS</th>
                          <th className="p-4">Especialidade</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {appointments.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-900/30 transition">
                            <td className="p-4 font-bold text-indigo-400">
                              {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4 font-semibold text-white">{app.patient.name}</td>
                            <td className="p-4">{app.ubs.name}</td>
                            <td className="p-4">{app.specialty.name}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${app.status === 'PACIENTE_CHEGOU' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : app.status === 'EM_ATENDIMENTO' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-950 text-slate-500'}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {app.status === 'PACIENTE_CHEGOU' && (
                                <button
                                  onClick={() => handleStartAttendance(app)}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                                >
                                  Iniciar Atendimento
                                </button>
                              )}
                              {app.status === 'EM_ATENDIMENTO' && (
                                <button
                                  onClick={() => { setActiveAppointment(app); setView('doctor-attendance'); }}
                                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                                >
                                  Retomar Atendimento
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}

                        {appointments.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-slate-500 italic">Nenhum agendamento na sua agenda hoje.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- DOCTOR ATTENDANCE / CONSULTA -------------------- */}
            {user.role === 'MEDICO' && view === 'doctor-attendance' && activeAppointment && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <BriefcaseMedical className="h-5 w-5 text-indigo-400" /> Prontuário Médico - Evolução
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Atendimento do paciente: <span className="font-bold text-slate-200">{activeAppointment.patient.name}</span></p>
                  </div>
                  <button
                    onClick={() => { setView('home'); setActiveAppointment(null); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Voltar para Agenda
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Evolution Inputs */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Evolução do Caso</h3>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anamnese / Evolução Clínica</label>
                        <textarea
                          rows={4}
                          value={evolution}
                          onChange={(e) => setEvolution(e.target.value)}
                          placeholder="Descreva a anamnese do paciente e a evolução clínica..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnóstico</label>
                          <textarea
                            rows={3}
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="CID ou diagnóstico descritivo..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Conduta Clínica</label>
                          <textarea
                            rows={3}
                            value={conduct}
                            onChange={(e) => setConduct(e.target.value)}
                            placeholder="Ex: Repouso por 3 dias, hidratação..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prescribe Medications */}
                    <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Prescrever Medicamento (Reserva em Estoque)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Selecione o Medicamento</label>
                          <select
                            value={selectedMedId}
                            onChange={(e) => setSelectedMedId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none"
                          >
                            <option value="">Selecione...</option>
                            {medications.map((m) => (
                              <option key={m.id} value={m.id}>{m.name} ({m.dosageForm})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dosagem</label>
                          <input
                            type="text"
                            value={medDosage}
                            onChange={(e) => setMedDosage(e.target.value)}
                            placeholder="Ex: 500mg"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Frequência</label>
                          <input
                            type="text"
                            value={medFreq}
                            onChange={(e) => setMedFreq(e.target.value)}
                            placeholder="Ex: 8h em 8h"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Duração</label>
                          <input
                            type="text"
                            value={medDur}
                            onChange={(e) => setMedDur(e.target.value)}
                            placeholder="Ex: 7 dias"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quantidade Solicitada</label>
                          <input
                            type="number"
                            min={1}
                            value={medQty}
                            onChange={(e) => setMedQty(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-400 font-bold"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMedicationToPrescription}
                        className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Adicionar na Receita
                      </button>

                      {/* Prescribed List */}
                      {prescribedItems.length > 0 && (
                        <div className="border-t border-slate-800 pt-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Itens da Receita</h4>
                          <div className="space-y-2">
                            {prescribedItems.map((item, idx) => (
                              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-white">{item.medicationName}</p>
                                  <p className="text-[10px] text-slate-500">{item.dosage} | {item.frequency} | {item.duration} | Qtd: {item.qtyRequested}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePrescribedItem(idx)}
                                  className="text-rose-400 hover:text-rose-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Exams and Referrals */}
                  <div className="space-y-5">
                    {/* Exam Requests */}
                    <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Solicitar Exame</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExamName}
                          onChange={(e) => setNewExamName(e.target.value)}
                          placeholder="Nome do exame (Ex: Hemograma)"
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddExamToRequest}
                          className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold p-2 rounded-xl transition"
                        >
                          <Plus className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      {/* Requested Exams */}
                      {examsRequestList.length > 0 && (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {examsRequestList.map((ex, idx) => (
                            <div key={idx} className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                              <span className="text-slate-300">{ex.examName}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExamItem(idx)}
                                className="text-rose-450 hover:text-rose-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Referrals */}
                    <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Encaminhar Paciente</h3>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">UBS de Destino</label>
                        <select
                          value={refDestUbsId}
                          onChange={(e) => setRefDestUbsId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none"
                        >
                          <option value="">Selecione...</option>
                          {ubsList.filter(u => u.id !== activeAppointment.ubsId).map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Especialidade Indicada</label>
                        <select
                          value={refSpecId}
                          onChange={(e) => setRefSpecId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none"
                        >
                          <option value="">Selecione...</option>
                          {specialties.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Motivo do Encaminhamento</label>
                        <textarea
                          rows={2}
                          value={refReason}
                          onChange={(e) => setRefReason(e.target.value)}
                          placeholder="Justifique o encaminhamento..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350"
                        />
                      </div>
                    </div>

                    {/* Finalize Button */}
                    <button
                      onClick={handleSaveAttendance}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-5 w-5" /> Finalizar Atendimento Clínico
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- ATENDENTE RECEPTION / CHECK IN -------------------- */}
            {user.role === 'ATENDENTE' && view === 'home' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Recepção e Check-in Operacional</h2>
                  <p className="text-slate-400 text-xs mt-1">Marque presença de consultas agendadas ou registre a chegada física do paciente na recepção.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="p-4">Data / Hora</th>
                          <th className="p-4">Paciente</th>
                          <th className="p-4">UBS</th>
                          <th className="p-4">Médico</th>
                          <th className="p-4">Especialidade</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Presença</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {appointments.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-900/30 transition">
                            <td className="p-4 font-bold text-indigo-400">
                              {new Date(app.dateTime).toLocaleDateString()} {new Date(app.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-4 font-semibold text-white">{app.patient.name}</td>
                            <td className="p-4">{app.ubs.name}</td>
                            <td className="p-4">{app.doctor.name}</td>
                            <td className="p-4">{app.specialty.name}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${app.status === 'AGENDADA' ? 'bg-indigo-500/10 text-indigo-300' : app.status === 'CONFIRMADA' ? 'bg-indigo-500/25 text-indigo-200' : app.status === 'PACIENTE_CHEGOU' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-950 text-slate-500'}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {app.status === 'AGENDADA' && (
                                <button
                                  onClick={() => handleConfirmPresence(app.id)}
                                  className="bg-indigo-650 hover:bg-indigo-550 text-white font-semibold px-3 py-1.5 rounded-lg transition text-[10px]"
                                >
                                  Confirmar Presença
                                </button>
                              )}
                              {['AGENDADA', 'CONFIRMADA'].includes(app.status) && (
                                <button
                                  onClick={() => handleCheckInPatient(app.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition text-[10px]"
                                >
                                  Registrar Chegada
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}

                        {appointments.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-10 text-slate-500 italic">Nenhum agendamento cadastrado.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- ATENDENTE PATIENTS VIEW -------------------- */}
            {user.role === 'ATENDENTE' && view === 'atendente-patients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Cadastro de Pacientes</h2>
                    <p className="text-slate-400 text-xs mt-1">Busque pacientes existentes ou realize cadastro operacional para triagem.</p>
                  </div>
                  <button
                    onClick={() => setView('atendente-register-form')}
                    className="bg-indigo-650 hover:bg-indigo-550 text-white font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 text-xs"
                  >
                    <Plus className="h-4.5 w-4.5" /> Novo Cadastro Operacional
                  </button>
                </div>

                {/* Patient Lookup Search */}
                <div className="flex gap-2 max-w-md bg-slate-900 border border-slate-850 p-2.5 rounded-xl">
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Buscar por Nome ou CPF..."
                    className="flex-1 bg-transparent text-sm focus:outline-none px-2"
                  />
                  <button
                    onClick={handleAtendentePatientLookup}
                    className="bg-indigo-650 hover:bg-indigo-550 p-2 rounded-lg text-white"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {/* Patients Table */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl shadow-xl overflow-hidden mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="p-4">Nome</th>
                        <th className="p-4">CPF</th>
                        <th className="p-4">Telefone</th>
                        <th className="p-4">Bairro (Zoneamento)</th>
                        <th className="p-4">UBS de Referência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-350">
                      {patientList.map((pat) => (
                        <tr key={pat.id} className="hover:bg-slate-900/30 transition">
                          <td className="p-4 font-bold text-white">{pat.name}</td>
                          <td className="p-4">{pat.cpf}</td>
                          <td className="p-4">{pat.phone}</td>
                          <td className="p-4">{pat.address.neighborhood}</td>
                          <td className="p-4 font-semibold text-indigo-400">
                            {pat.routingUbs?.name || 'UBS Paulista (Backup)'}
                          </td>
                        </tr>
                      ))}

                      {patientList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-500 italic">Realize uma busca por pacientes.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* -------------------- ATENDENTE REGISTRATION FORM -------------------- */}
            {user.role === 'ATENDENTE' && view === 'atendente-register-form' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Cadastro Operacional de Paciente</h2>
                    <p className="text-slate-400 text-xs mt-1">Realize a matrícula de novo paciente, validando o bairro para zoneamento.</p>
                  </div>
                  <button
                    onClick={() => setView('atendente-patients')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Voltar
                  </button>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl">
                  <form onSubmit={handleRegisterPatientOperational} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">CPF</label>
                        <input
                          type="text"
                          required
                          value={regCpf}
                          onChange={(e) => setRegCpf(e.target.value)}
                          placeholder="111.111.111-11"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Data de Nascimento</label>
                        <input
                          type="date"
                          required
                          value={regBirth}
                          onChange={(e) => setRegBirth(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Telefone</label>
                        <input
                          type="text"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="(11) 99999-8888"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider pt-4 border-t border-slate-800">
                      Endereço e Zoneamento
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Rua</label>
                        <input
                          type="text"
                          required
                          value={regStreet}
                          onChange={(e) => setRegStreet(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Número</label>
                        <input
                          type="text"
                          required
                          value={regNum}
                          onChange={(e) => setRegNum(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bairro</label>
                        <select
                          required
                          value={regNeigh}
                          onChange={(e) => setRegNeigh(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        >
                          <option value="">Selecione...</option>
                          <option value="Centro">Centro (Referência: UBS Centro)</option>
                          <option value="Bela Vista">Bela Vista (Referência: UBS Centro)</option>
                          <option value="Jardim Paulista">Jardim Paulista (Referência: UBS Paulista)</option>
                          <option value="Consolação">Consolação (Referência: UBS Paulista)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">CEP</label>
                        <input
                          type="text"
                          required
                          value={regZip}
                          onChange={(e) => setRegZip(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg mt-4"
                    >
                      Matricular e Cadastrar Paciente
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* -------------------- FARMACEUTICO HOME / DISPENSACAO -------------------- */}
            {user.role === 'FARMACEUTICO' && view === 'home' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Dispensação e Baixa de Medicamentos</h2>
                  <p className="text-slate-400 text-xs mt-1">Valide receitas e faça a liberação definitiva dos medicamentos reservados no estoque.</p>
                </div>

                {/* Select Current Pharmacy Hub */}
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-850 p-4 rounded-xl max-w-md">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Farmácia da Unidade</label>
                    <select
                      value={selectedUbsId}
                      onChange={(e) => { setSelectedUbsId(e.target.value); loadPharmacyData(e.target.value); }}
                      className="w-full bg-transparent font-bold text-sm text-white focus:outline-none focus:ring-0 mt-0.5"
                    >
                      {ubsList.map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-950">{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Select appointment with reservation */}
                  <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendimentos Médicos Concluídos</h3>
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {appointments.filter(a => ['ATENDIDA', 'ENCAMINHADA'].includes(a.status)).map((app) => (
                        <button
                          key={app.id}
                          onClick={() => { setActiveAppointment(app); handleLoadPrescriptionItems(app.id); }}
                          className={`w-full text-left p-3 rounded-xl border transition flex flex-col justify-between ${activeAppointment?.id === app.id ? 'bg-indigo-650/15 border-indigo-450 text-white' : 'bg-slate-950/80 border-slate-850 text-slate-350 hover:border-slate-700'}`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5 w-full">
                            <span>{new Date(app.dateTime).toLocaleDateString()}</span>
                            <span>{app.ubs.name}</span>
                          </div>
                          <span className="font-bold text-xs">{app.patient.name}</span>
                          <span className="text-[10px] text-indigo-400 font-semibold mt-1">Médico: {app.doctor.name}</span>
                        </button>
                      ))}

                      {appointments.filter(a => ['ATENDIDA', 'ENCAMINHADA'].includes(a.status)).length === 0 && (
                        <p className="text-xs text-slate-500 italic py-4 text-center">Nenhum atendimento finalizado no sistema.</p>
                      )}
                    </div>
                  </div>

                  {/* Recipe items and release */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                      Itens da Receita e Dispensação
                    </h3>
                    
                    {activeAppointment ? (
                      <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                          <p className="text-xs text-slate-400">Paciente: <span className="font-bold text-white">{activeAppointment.patient.name}</span></p>
                          <p className="text-xs text-slate-400 mt-1">Receita emitida por: <span className="font-semibold text-slate-300">{activeAppointment.doctor.name}</span></p>
                        </div>

                        <div className="space-y-3">
                          {dispenseReservations.map((item) => (
                            <div key={item.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <p className="font-bold text-sm text-white">{item.medication.name}</p>
                                <p className="text-[11px] text-slate-500 mt-1">Dosagem: {item.dosage} | Freq: {item.frequency} | Duração: {item.duration}</p>
                                <p className="text-[11px] font-bold text-indigo-400 mt-1">Solicitado: {item.qtyRequested} | Dispensado: {item.qtyDispensed}</p>
                                
                                {/* Reservation info */}
                                {item.reservations.length > 0 && (
                                  <div className="mt-2 bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-lg text-[10px] text-indigo-350">
                                    <span className="font-bold block uppercase mb-1">Reservas associadas (FEFO):</span>
                                    {item.reservations.map((res: any) => (
                                      <div key={res.id} className="flex justify-between">
                                        <span>Lote: {res.lot.lotNumber} (Vence: {new Date(res.lot.expirationDate).toLocaleDateString()})</span>
                                        <span className="font-bold">Qtd Reservada: {res.quantity} ({res.status})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {item.qtyRequested > item.qtyDispensed && (
                                <button
                                  onClick={() => handleDispenseItem(item.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition self-stretch sm:self-auto"
                                >
                                  Dispensar & Baixar
                                </button>
                              )}

                              {item.qtyRequested <= item.qtyDispensed && (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1">
                                  <Check className="h-4.5 w-4.5" /> Entregue
                                </span>
                              )}
                            </div>
                          ))}

                          {dispenseReservations.length === 0 && (
                            <p className="text-xs text-slate-500 italic py-6 text-center">Nenhum item pendente de dispensação nesta receita.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-550 py-10 text-center italic">Selecione um atendimento concluído à esquerda para visualizar a receita.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- FARMACEUTICO INVENTORY / LOTS -------------------- */}
            {user.role === 'FARMACEUTICO' && view === 'pharmacy-inventory' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Controle de Lotes e Inventário da Farmácia</h2>
                  <p className="text-slate-400 text-xs mt-1">Registre a entrada de novos lotes de medicamentos, controle perdas ou realize devoluções.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left form: Add Lot */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Entrada de Lote</h3>
                    <form onSubmit={handleAddStockLot} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Medicamento</label>
                        <select
                          required
                          value={pharmMedId}
                          onChange={(e) => setPharmMedId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none"
                        >
                          <option value="">Selecione...</option>
                          {medications.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Nº do Lote</label>
                          <input
                            type="text"
                            required
                            value={pharmLot}
                            onChange={(e) => setPharmLot(e.target.value)}
                            placeholder="L-100"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Quantidade Física</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={pharmQty}
                            onChange={(e) => setPharmQty(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold text-indigo-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Data de Validade</label>
                        <input
                          type="date"
                          required
                          value={pharmExp}
                          onChange={(e) => setPharmExp(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Data Fabricação</label>
                          <input
                            type="date"
                            value={pharmMfg}
                            onChange={(e) => setPharmMfg(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Fornecedor</label>
                          <input
                            type="text"
                            value={pharmSupplier}
                            onChange={(e) => setPharmSupplier(e.target.value)}
                            placeholder="Laboratório"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition tracking-wider mt-4"
                      >
                        Registrar Entrada de Lote
                      </button>
                    </form>
                  </div>

                  {/* Middle Column: Stock Adjustments (Loss/Return) */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Ajuste de Estoque (Perda/Devolução)</h3>
                    <form onSubmit={handleAdjustInventory} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Medicamento</label>
                        <select
                          required
                          value={adjustMedId}
                          onChange={(e) => handleSelectMedicationForAdjust(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-350"
                        >
                          <option value="">Selecione...</option>
                          {medications.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      {adjustMedId && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Lote Específico</label>
                          <select
                            required
                            value={adjustLotId}
                            onChange={(e) => setAdjustLotId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-350"
                          >
                            <option value="">Selecione...</option>
                            {adjustLotList.map((l) => (
                              <option key={l.id} value={l.id}>Lote: {l.lotNumber} (Estoque Físico: {l.quantityPhysical})</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Ajuste de Qtd</label>
                          <input
                            type="number"
                            required
                            value={adjustQty}
                            onChange={(e) => setAdjustQty(Number(e.target.value))}
                            placeholder="Qtd absoluta"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Tipo do Ajuste</label>
                          <select
                            value={adjustType}
                            onChange={(e) => setAdjustType(e.target.value as any)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-350 focus:outline-none"
                          >
                            <option value="LOSS">Perda (Estoque -)</option>
                            <option value="RETURN">Devolução (Estoque +)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Motivo / Observação</label>
                        <input
                          type="text"
                          required
                          value={adjustRemarks}
                          onChange={(e) => setAdjustRemarks(e.target.value)}
                          placeholder="Ex: Danificado, extraviado..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-amber-650 hover:bg-amber-550 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition tracking-wider mt-4"
                      >
                        Registrar Ajuste de Estoque
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Inventory Alerts */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-4.5 w-4.5" /> Alertas Ativos
                    </h3>

                    {/* Stock Alert list */}
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {inventoryAlerts.map((al, idx) => (
                        <div key={idx} className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-rose-300">{al.name}</p>
                            <p className="text-[10px] text-slate-500">Estoque atual: {al.currentStock} | Mínimo: {al.minStock}</p>
                          </div>
                          <span className="text-[9px] font-bold bg-rose-500/10 text-rose-455 px-2.5 py-0.5 rounded-full uppercase">Crítico</span>
                        </div>
                      ))}

                      {/* Expiration alert list */}
                      {expiringLots.map((lot, idx) => (
                        <div key={idx} className={`p-3 rounded-xl flex items-center justify-between text-xs border ${lot.status === 'VENCIDO' ? 'bg-rose-500/5 border-rose-500/10 text-rose-300' : 'bg-amber-500/5 border-amber-500/10 text-amber-300'}`}>
                          <div>
                            <p className="font-bold">{lot.medicationName}</p>
                            <p className="text-[10px] text-slate-550">Lote: {lot.lotNumber} | Validade: {new Date(lot.expirationDate).toLocaleDateString()}</p>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider">{lot.status}</span>
                        </div>
                      ))}

                      {inventoryAlerts.length === 0 && expiringLots.length === 0 && (
                        <p className="text-xs text-slate-500 italic py-6 text-center">Nenhum alerta de validade ou estoque mínimo ativo.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock table */}
                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-white">Inventário de Medicamentos Agregado</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="p-4">Medicamento</th>
                          <th className="p-4">Forma Farmacêutica</th>
                          <th className="p-4 text-center">Estoque Agregado</th>
                          <th className="p-4 text-center">Estoque Mínimo</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-350">
                        {inventoryList.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-900/30 transition">
                            <td className="p-4 font-bold text-white">{inv.medication.name}</td>
                            <td className="p-4">{inv.medication.dosageForm}</td>
                            <td className="p-4 text-center font-bold text-indigo-400">{inv.quantity}</td>
                            <td className="p-4 text-center">{inv.medication.minStock}</td>
                            <td className="p-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${inv.quantity < inv.medication.minStock ? 'bg-rose-500/10 text-rose-350' : 'bg-emerald-500/10 text-emerald-300'}`}>
                                {inv.quantity < inv.medication.minStock ? 'Abaixo do Mínimo' : 'Regular'}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {inventoryList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-6 text-slate-550 italic">Nenhum estoque cadastrado para esta UBS.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- GESTOR HOME / DASHBOARD -------------------- */}
            {['GESTOR', 'ADMINISTRADOR'].includes(user.role) && view === 'home' && kpiStats && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-400" /> Relatórios e Indicadores Gerenciais de Saúde
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Análise em tempo real de atendimentos, demanda por especialidade e controle de medicamentos.</p>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-bold text-slate-450 uppercase">Consultas Agendadas</span>
                    <p className="text-2xl font-extrabold text-white mt-1.5">{kpiStats.appointments.agendadas}</p>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 block">Total histórico: {kpiStats.appointments.total}</span>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-bold text-slate-450 uppercase">Consultas Realizadas</span>
                    <p className="text-2xl font-extrabold text-white mt-1.5">{kpiStats.appointments.atendidas}</p>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 block">Faltas registradas: {kpiStats.appointments.faltas}</span>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-bold text-slate-455 uppercase">Estoque Abaixo do Mínimo</span>
                    <p className="text-2xl font-extrabold text-rose-400 mt-1.5">{kpiStats.inventory.belowMinCount}</p>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 block">Itens cadastrados: {kpiStats.inventory.totalItems}</span>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-bold text-slate-455 uppercase">Lotes Vencidos em Estoque</span>
                    <p className="text-2xl font-extrabold text-amber-400 mt-1.5">{kpiStats.inventory.expiredCount}</p>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 block">Próximos do vencimento: {kpiStats.inventory.expiring30Days}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Specialty Demands */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Demanda por Especialidade</h3>
                    <div className="space-y-3.5">
                      {kpiStats.specialties.map((spec: any, idx: number) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-300">{spec.name}</span>
                            <span className="text-white font-bold">{spec.count} consultas</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                            <div
                              className="bg-indigo-550 h-full rounded-full"
                              style={{ width: `${Math.min((spec.count / kpiStats.appointments.total) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}

                      {kpiStats.specialties.length === 0 && (
                        <p className="text-xs text-slate-550 italic py-4 text-center">Sem dados de atendimentos cadastrados.</p>
                      )}
                    </div>
                  </div>

                  {/* Recent inventory movements */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Movimentações de Medicamentos Recentes
                    </h3>
                    <div className="overflow-x-auto max-h-[300px]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold">
                            <th className="p-3">Medicamento</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3 text-center">Qtd</th>
                            <th className="p-3">Data</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-350">
                          {kpiStats.recentMovements.map((m: any) => (
                            <tr key={m.id} className="hover:bg-slate-900/30 transition">
                              <td className="p-3 font-semibold text-white">{m.medicationName}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${m.type === 'INPUT' ? 'bg-emerald-500/10 text-emerald-350' : m.type === 'RESERVED' ? 'bg-indigo-500/10 text-indigo-350' : 'bg-rose-500/10 text-rose-350'}`}>
                                  {m.type}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold">{m.quantity}</td>
                              <td className="p-3 text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}

                          {kpiStats.recentMovements.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center py-6 text-slate-550 italic">Nenhuma movimentação de estoque recente.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- ADMIN UBS / ZONES MANAGEMENT -------------------- */}
            {user.role === 'ADMINISTRADOR' && view === 'admin-ubs' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Gerenciar Unidades de Saúde e Zonas</h2>
                  <p className="text-slate-400 text-xs mt-1">Cadastre novas UBS, defina zonas de atendimento por bairro e gerencie especialidades.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form: Create UBS */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Cadastrar Nova UBS</h3>
                    <form onSubmit={handleCreateUbs} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Nome da UBS</label>
                        <input
                          type="text"
                          required
                          value={newUbsName}
                          onChange={(e) => setNewUbsName(e.target.value)}
                          placeholder="UBS Bairro Novo"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Código Único</label>
                          <input
                            type="text"
                            required
                            value={newUbsCode}
                            onChange={(e) => setNewUbsCode(e.target.value)}
                            placeholder="UBS-003"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Telefone</label>
                          <input
                            type="text"
                            required
                            value={newUbsPhone}
                            onChange={(e) => setNewUbsPhone(e.target.value)}
                            placeholder="(11) 3333-3333"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">E-mail</label>
                        <input
                          type="email"
                          required
                          value={newUbsEmail}
                          onChange={(e) => setNewUbsEmail(e.target.value)}
                          placeholder="novoubs@ubs.gov.br"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={newUbsLat}
                            onChange={(e) => setNewUbsLat(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={newUbsLng}
                            onChange={(e) => setNewUbsLng(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Rua / Av.</label>
                        <input
                          type="text"
                          required
                          value={newUbsStreet}
                          onChange={(e) => setNewUbsStreet(e.target.value)}
                          placeholder="Av Central"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Número</label>
                          <input
                            type="text"
                            required
                            value={newUbsNum}
                            onChange={(e) => setNewUbsNum(e.target.value)}
                            placeholder="123"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Bairro Principal</label>
                          <input
                            type="text"
                            required
                            value={newUbsNeigh}
                            onChange={(e) => setNewUbsNeigh(e.target.value)}
                            placeholder="Vila Nova"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition tracking-wider mt-2 shadow"
                      >
                        Salvar UBS
                      </button>
                    </form>
                  </div>

                  {/* Middle Column: Zone configuration */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Definir Zona de Atendimento</h3>
                    <form onSubmit={handleAddZone} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Unidade (UBS)</label>
                        <select
                          required
                          value={newZoneUbsId}
                          onChange={(e) => setNewZoneUbsId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-350"
                        >
                          <option value="">Selecione...</option>
                          {ubsList.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Nome do Bairro Atendido</label>
                        <input
                          type="text"
                          required
                          value={newZoneName}
                          onChange={(e) => setNewZoneName(e.target.value)}
                          placeholder="Ex: Vila Mariana"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition tracking-wider shadow"
                      >
                        Associar Bairro à UBS
                      </button>
                    </form>

                    {/* Zone mapping lists */}
                    <div className="border-t border-slate-800 pt-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Zoneamentos Ativos</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {ubsList.flatMap((u) => u.zones?.map((z: any) => (
                          <div key={z.id} className="bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-white">{z.neighborhood}</span>
                              <span className="text-[10px] text-slate-500 block">Atendido por: {u.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveZone(z.id)}
                              className="text-rose-455 hover:text-rose-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )) || [])}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: UBS listing */}
                  <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl shadow-lg space-y-4">
                    <h3 className="text-sm font-bold text-white">Unidades UBS Cadastradas</h3>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {ubsList.map((u) => (
                        <div key={u.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-white">{u.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                              {u.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 space-y-0.5">
                            <p>Código: {u.code}</p>
                            <p>Fone: {u.phone}</p>
                            <p>Endereço: {u.address.street}, {u.address.number} - {u.address.neighborhood}</p>
                            <p className="font-semibold text-indigo-400">Capacidade: {u.capacity} atendimentos/dia</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- ADMIN USERS CREATION -------------------- */}
            {user.role === 'ADMINISTRADOR' && view === 'admin-users' && (
              <div className="space-y-6 max-w-4xl">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Cadastro de Usuários Internos</h2>
                  <p className="text-slate-400 text-xs mt-1">Crie contas para Médicos, Atendentes, Farmacêuticos, Gestores ou outros Administradores.</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl">
                  <form onSubmit={handleCreateInternalUser} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={intName}
                          onChange={(e) => setIntName(e.target.value)}
                          placeholder="Nome do colaborador"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-355"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Papel / Função (Role)</label>
                        <select
                          value={intRole}
                          onChange={(e) => setIntRole(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-355"
                        >
                          <option value="ATENDENTE">Atendente operacional</option>
                          <option value="FARMACEUTICO">Farmacêutico (Gestão Estoque/Dispensação)</option>
                          <option value="MEDICO">Médico Clínico</option>
                          <option value="GESTOR">Gestor Administrativo</option>
                          <option value="ADMINISTRADOR">Administrador Geral do Sistema</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">E-mail Corporativo</label>
                        <input
                          type="email"
                          required
                          value={intEmail}
                          onChange={(e) => setIntEmail(e.target.value)}
                          placeholder="email@ubs.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-355"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Senha de Acesso</label>
                        <input
                          type="password"
                          required
                          value={intPassword}
                          onChange={(e) => setIntPassword(e.target.value)}
                          placeholder="Mínimo 6 dígitos"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-355"
                        />
                      </div>
                    </div>

                    {/* Doctor Specific Info */}
                    {intRole === 'MEDICO' && (
                      <div className="bg-slate-955 p-5 rounded-2xl border border-slate-850 space-y-4 pt-4 mt-2">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Informações Profissionais (Médico)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">CPF</label>
                            <input
                              type="text"
                              required
                              value={intCpf}
                              onChange={(e) => setIntCpf(e.target.value)}
                              placeholder="111.111.111-11"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">CRM</label>
                            <input
                              type="text"
                              required
                              value={intCrm}
                              onChange={(e) => setIntCrm(e.target.value)}
                              placeholder="123456-SP"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs"
                            />
                          </div>
                        </div>

                        {/* Specialties checklists */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-450 uppercase mb-2">Selecione Especialidades Clínicas</label>
                          <div className="grid grid-cols-2 gap-2">
                            {specialties.map((spec) => (
                              <button
                                key={spec.id}
                                type="button"
                                onClick={() => toggleIntSpec(spec.id)}
                                className={`px-3 py-2 rounded-lg text-left text-xs border transition ${intSpecIds.includes(spec.id) ? 'bg-indigo-650/20 border-indigo-400 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                              >
                                {spec.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* UBS assignment checklist */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-450 uppercase mb-2">Vincular às Unidades UBS</label>
                          <div className="grid grid-cols-2 gap-2">
                            {ubsList.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => toggleIntUbs(u.id)}
                                className={`px-3 py-2 rounded-lg text-left text-xs border transition ${intUbsIds.includes(u.id) ? 'bg-indigo-650/20 border-indigo-400 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                              >
                                {u.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-indigo-655 hover:bg-indigo-555 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg mt-4"
                    >
                      Cadastrar Colaborador
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
