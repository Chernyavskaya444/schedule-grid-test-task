import { Resource } from './resources';

export interface ScheduleDay {
  date: Date;
  resourceId: number;
  scheduleDayKey: string;
  scheduleRecord: ScheduleRecord;
  scheduleCells: ScheduleDayCell[];
}

export enum SchedulePeriod {
  Day = 'Day',
  TwoDays = 'TwoDays',
  Week = 'Week',
}

export enum ScheduleRangeType {
  AllowAppointment = 'AllowAppointment',
  NotWorking = 'NotWorking',
  Training = 'Training',
  PaperWorking = 'PaperWorking',
  NoAppointment = 'NoAppointment',
  OutsideWorking = 'OutsideWorking',
}

export type WorkingWeekdays = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeInterval {
  start: string;
  end: string;
}

export interface DateInterval {
  startDate: string;
  endDate: string;
}

export interface ScheduleDayCell {
  rangeId: number | null;
  rangeType: ScheduleRangeType;
  interval: Interval;
}

export interface ScheduleRange {
  id: number;
  title: string;
  time: TimeInterval;
  type: ScheduleRangeType;
  weekdays: WorkingWeekdays[];
}

export interface ScheduleRecord {
  id: number;
  resourceId: number;
  startDate: string;
  endDate: string;
  workingHours: TimeInterval;
  workingWeekdays: WorkingWeekdays[];
  intervalDuration: number;
  ranges: ScheduleRange[];
}

export interface ResourceScheduleDay extends ScheduleDay {
  resource: Resource;
}

export const ScheduleRangeTypeLabel = {
  AllowAppointment: 'Запись на прием',
  NotWorking: 'Врач не работает',
  Training: 'Обучение',
  PaperWorking: 'Работа с документами',
  NoAppointment: 'Нет записи',
  OutsideWorking: 'Врач не принимает',
};
