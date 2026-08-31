import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  patientId?: string;
  doctorId?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
