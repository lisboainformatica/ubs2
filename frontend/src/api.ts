const API_BASE_URL = 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('ubs_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, passwordHash: string) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, passwordHash }),
      }),
    registerPatient: (data: any) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createInternalUser: (data: any) =>
      request('/auth/create-user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  ubs: {
    getAll: (filters?: { status?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      return request(`/ubs?${params.toString()}`);
    },
    getOne: (id: string) => request(`/ubs/${id}`),
    create: (data: any) =>
      request('/ubs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request(`/ubs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    addZone: (ubsId: string, neighborhood: string) =>
      request(`/ubs/${ubsId}/zones`, {
        method: 'POST',
        body: JSON.stringify({ neighborhood }),
      }),
    removeZone: (zoneId: string) =>
      request(`/ubs/zones/${zoneId}`, {
        method: 'DELETE',
      }),
    getSpecialties: () => request('/specialties'),
    createSpecialty: (name: string, description?: string) =>
      request('/specialties', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      }),
    linkSpecialty: (ubsId: string, specialtyId: string) =>
      request(`/ubs/${ubsId}/specialties`, {
        method: 'POST',
        body: JSON.stringify({ specialtyId }),
      }),
    unlinkSpecialty: (ubsId: string, specialtyId: string) =>
      request(`/ubs/${ubsId}/specialties/${specialtyId}`, {
        method: 'DELETE',
      }),
  },
  doctors: {
    getAll: (filters?: { ubsId?: string; specialtyId?: string }) => {
      const params = new URLSearchParams();
      if (filters?.ubsId) params.set('ubsId', filters.ubsId);
      if (filters?.specialtyId) params.set('specialtyId', filters.specialtyId);
      return request(`/doctors?${params.toString()}`);
    },
    getOne: (id: string) => request(`/doctors/${id}`),
    getSchedule: (id: string, ubsId?: string) => {
      const params = new URLSearchParams();
      if (ubsId) params.set('ubsId', ubsId);
      return request(`/doctors/${id}/schedule?${params.toString()}`);
    },
    saveSchedule: (id: string, ubsId: string, schedules: any[]) =>
      request(`/doctors/${id}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ ubsId, schedules }),
      }),
  },
  patients: {
    getMe: () => request('/patients/me'),
    updateMe: (data: any) =>
      request('/patients/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getAll: (search?: string) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      return request(`/patients?${params.toString()}`);
    },
    createOperational: (data: any) =>
      request('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  appointments: {
    getSlots: (doctorId: string, date: string, specialtyId: string) => {
      const params = new URLSearchParams({ doctorId, date, specialtyId });
      return request(`/appointments/available-slots?${params.toString()}`);
    },
    getAll: (filters?: { patientId?: string; doctorId?: string; ubsId?: string; status?: string; date?: string }) => {
      const params = new URLSearchParams();
      if (filters?.patientId) params.set('patientId', filters.patientId);
      if (filters?.doctorId) params.set('doctorId', filters.doctorId);
      if (filters?.ubsId) params.set('ubsId', filters.ubsId);
      if (filters?.status) params.set('status', filters.status);
      if (filters?.date) params.set('date', filters.date);
      return request(`/appointments?${params.toString()}`);
    },
    getOne: (id: string) => request(`/appointments/${id}`),
    create: (data: any) =>
      request('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      request(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  medicalRecords: {
    createAttendance: (data: any) =>
      request('/medical-records/attendances', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAttendance: (appointmentId: string) =>
      request(`/medical-records/attendances/appointment/${appointmentId}`),
    getHistory: (patientId: string) => request(`/medical-records/history/${patientId}`),
    getReferrals: (filters?: { patientId?: string; originUbsId?: string; destinationUbsId?: string }) => {
      const params = new URLSearchParams();
      if (filters?.patientId) params.set('patientId', filters.patientId);
      if (filters?.originUbsId) params.set('originUbsId', filters.originUbsId);
      if (filters?.destinationUbsId) params.set('destinationUbsId', filters.destinationUbsId);
      return request(`/medical-records/referrals?${params.toString()}`);
    },
  },
  pharmacy: {
    createMedication: (data: any) =>
      request('/inventory/medications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMedications: () => request('/inventory/medications'),
    addLot: (data: any) =>
      request('/inventory/lots', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    dispense: (prescriptionItemId: string) =>
      request('/inventory/dispense', {
        method: 'POST',
        body: JSON.stringify({ prescriptionItemId }),
      }),
    getAlerts: (ubsId: string) => request(`/inventory/alerts?ubsId=${ubsId}`),
    getExpiring: (ubsId: string) => request(`/inventory/expiring?ubsId=${ubsId}`),
    getInventory: (ubsId: string) => request(`/inventory?ubsId=${ubsId}`),
    getLotsList: (ubsId: string, medicationId?: string) => {
      const params = new URLSearchParams({ ubsId });
      if (medicationId) params.set('medicationId', medicationId);
      return request(`/inventory/lots-list?${params.toString()}`);
    },
    adjust: (data: any) =>
      request('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMovements: (ubsId?: string) => {
      const params = new URLSearchParams();
      if (ubsId) params.set('ubsId', ubsId);
      return request(`/inventory/movements?${params.toString()}`);
    },
  },
  reports: {
    getDashboard: (ubsId?: string) => {
      const params = new URLSearchParams();
      if (ubsId) params.set('ubsId', ubsId);
      return request(`/reports/dashboard?${params.toString()}`);
    },
    getUbs: () => request('/reports/ubs'),
  },
};
