import { addDays, addSeconds, differenceInMinutes } from 'date-fns';
import { formatDate, parseDate } from './dateUtils';
import {
  ScheduleDay,
  SchedulePeriod,
  ScheduleRangeType,
} from '../types/schedules';

export const getScheduleDayKey = (day: Date, resourceId: number) => {
  return `${formatDate(day)}-resource-${resourceId}`;
};

export const isAllowableTimeDistance = (timeInterval: Interval) => {
  const intervalDuration = differenceInMinutes(
    addSeconds(timeInterval.end, 1),
    timeInterval.start
  );
  return differenceInMinutes(timeInterval.start, new Date()) > intervalDuration;
};

export const getAvailableToAppointmentDates = (
  scheduledDays: ScheduleDay[]
): Date[] => {
  const dates = scheduledDays.reduce<string[]>((result, item) => {
    const date = formatDate(item.date);
    if (result.includes(date)) {
      return result;
    }
    const hasAppointmentInterval = item.scheduleCells.some(
      (cell) => cell.rangeType === ScheduleRangeType.AllowAppointment
    );
    if (hasAppointmentInterval) {
      result.push(date);
    }
    return result;
  }, []);

  return dates.map((item) => parseDate(item));
};

export const getScheduleDateRange = (
  date: Date,
  schedulePeriod: SchedulePeriod
) => {
  switch (schedulePeriod) {
    case SchedulePeriod.Day:
      return getOneDayScheduleRange(date);

    case SchedulePeriod.TwoDays:
      return getTwoDaysScheduleRange(date);

    case SchedulePeriod.Week:
      return getWeekScheduleRange(date);
  }
};

const getOneDayScheduleRange = (date: Date) => {
  const formattedDate = formatDate(date);
  return {
    startDate: formattedDate,
    endDate: formattedDate,
  };
};

const getTwoDaysScheduleRange = (date: Date) => {
  const endDate = addDays(date, 1);
  return {
    startDate: formatDate(date),
    endDate: formatDate(endDate),
  };
};

const getWeekScheduleRange = (date: Date) => {
  const endDate = addDays(date, 6);
  return {
    startDate: formatDate(date),
    endDate: formatDate(endDate),
  };
};

export const getTwoWeeksScheduleRange = (date: Date) => {
  const endDate = addDays(date, 13);
  return {
    startDate: formatDate(date),
    endDate: formatDate(endDate),
  };
};

export const areElementsOverlappingByHalf = (
  topElement: Element | null,
  bottomElement: Element | null
) => {
  if (!topElement || !bottomElement) {
    return false;
  }
  const topRect = topElement.getBoundingClientRect().toJSON();
  const bottomRect = bottomElement.getBoundingClientRect().toJSON();
  const middlePoint = topRect.bottom - topRect.height / 2;

  return bottomRect.top < middlePoint;
};
