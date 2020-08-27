import { parse, format, isBefore, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

export const ISO_DATE = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm';
export const DISPLAY_DATE_FORMAT = 'dd.MM.yyyy';

export const parseTime = (
  time: string,
  baseDate: Date = new Date(),
  timeFormat = TIME_FORMAT
) => {
  return parse(time, timeFormat, baseDate, {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });
};

export const parseDate = (date: string, dateFormat = ISO_DATE) => {
  return parse(date, dateFormat, new Date(), {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });
};

export const formatDate = (
  date: Date | number,
  formatStr: string = ISO_DATE
) => {
  return format(date, formatStr, { locale: ru });
};

export const formatTime = (date: Date | number) =>
  formatDate(date, TIME_FORMAT);

export const isPastDay = (day: Date): boolean => {
  return isBefore(day, startOfDay(new Date()));
};
