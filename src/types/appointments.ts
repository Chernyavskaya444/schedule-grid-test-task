import { Patient } from './patients';
import { Resource } from './resources';

export interface Appointment {
  id: number;
  patientId: number;
  resourceId: number;
  date: string;
  time: string;
  notSaved?: boolean;
}

export interface AppointmentsWithRelations extends Appointment {
  patient: Patient;
  resource: Resource;
  datetime: Date;
  scheduleDayKey: string;
}
