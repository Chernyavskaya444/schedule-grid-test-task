import { isWithinInterval } from 'date-fns';
import { Appointment, AppointmentsWithRelations } from '../types/appointments';
import { Resource } from '../types/resources';
import { Patient } from '../types/patients';
import { getRecordsKeyedById } from './recordUtils';
import { formatDate, formatTime, parseDate, parseTime } from './dateUtils';
import { getScheduleDayKey } from './scheduleUtils';

export const createAppointmentRecord = (
  timeInterval: Interval,
  resource: Resource,
  patient: Patient
): Appointment => {
  return {
    id: Date.now(),
    patientId: patient.id,
    resourceId: resource.id,
    date: formatDate(timeInterval.start),
    time: formatTime(timeInterval.start),
    notSaved: true,
  };
};

export const getAppointmentsWithRelations = (
  appointments: Appointment[],
  resources: Resource[],
  patients: Patient[]
) => {
  const resourcesById = getRecordsKeyedById(resources);
  const patientsById = getRecordsKeyedById(patients);

  return appointments.map<AppointmentsWithRelations>((item) => {
    const datetime = parseTime(item.time, parseDate(item.date));
    const scheduleDayKey = getScheduleDayKey(datetime, item.resourceId);
    return {
      ...item,
      datetime,
      scheduleDayKey,
      resource: resourcesById[item.resourceId],
      patient: patientsById[item.patientId],
    };
  });
};

export const mergeAppointmentRecords = (loadedAppointments: Appointment[]) => (
  appointmentState: Appointment[]
) => {
  return [
    ...loadedAppointments,
    ...appointmentState.filter((item) => item.notSaved),
  ];
};

export const getAppointmentsByScheduleDay = (
  appointments: Appointment[],
  resources: Resource[],
  patients: Patient[]
) => {
  const appointmentsWithRelations = getAppointmentsWithRelations(
    appointments,
    resources,
    patients
  );
  return appointmentsWithRelations.reduce<{
    [p: string]: AppointmentsWithRelations[];
  }>((result, item) => {
    const { scheduleDayKey } = item;
    if (!result[scheduleDayKey]) {
      result[scheduleDayKey] = [];
    }
    result[scheduleDayKey].push(item);
    return result;
  }, {});
};

export const getAppointmentsForScheduleCell = (
  interval: Interval,
  appointments: AppointmentsWithRelations[]
) => {
  return appointments.filter(({ datetime }) =>
    isWithinInterval(datetime, interval)
  );
};
