import { areIntervalsOverlapping } from 'date-fns';
import { DateInterval, ScheduleRecord } from '../types/schedules';
import { parseDate } from '../utils/dateUtils';
import { scheduleRecords } from '../data';

export interface ScheduleParams {
  resourceIds: number[];
  dateRange: DateInterval;
}

export const getScheduleRecords = ({
  resourceIds,
  dateRange,
}: ScheduleParams) => {
  let schedules = getByResourceId(resourceIds, scheduleRecords);
  schedules = getByDateRange(dateRange, schedules);
  return schedules;
};

const getByResourceId = (
  resourceIds: number[],
  scheduleRecords: ScheduleRecord[]
) => {
  return scheduleRecords.filter((item) =>
    resourceIds.includes(item.resourceId)
  );
};

const getByDateRange = (
  { startDate, endDate }: DateInterval,
  scheduleRecords: ScheduleRecord[]
) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  return scheduleRecords.filter((record) =>
    areIntervalsOverlapping(
      { start, end },
      { start: parseDate(record.startDate), end: parseDate(record.endDate) },
      { inclusive: true }
    )
  );
};
