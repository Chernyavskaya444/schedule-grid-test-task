import { isWithinInterval } from 'date-fns';
import { appointments } from '../data';
import { parseDate } from '../utils/dateUtils';
import { Appointment } from '../types/appointments';
import { DateInterval } from '../types/schedules';

interface AppointmentRecordParams {
  resourceIds: number[];
  dateRange: DateInterval;
}

export const getByResourceId = (
  resourceIds: number[],
  appointmentRecords: Appointment[]
) => {
  return appointmentRecords.filter((item) =>
    resourceIds.includes(item.resourceId)
  );
};

export const getByDateRange = (
  dateRange: DateInterval,
  appointmentRecords: Appointment[]
) => {
  const { startDate, endDate } = dateRange;
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  return appointmentRecords.filter(({ date }) =>
    isWithinInterval(parseDate(date), { start, end })
  );
};

export const getAppointmentRecords = ({
  resourceIds,
  dateRange,
}: AppointmentRecordParams) => {
  let foundAppointments = getByResourceId(resourceIds, appointments);
  foundAppointments = getByDateRange(dateRange, foundAppointments);
  return foundAppointments;
};
