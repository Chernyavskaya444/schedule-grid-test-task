import { Patient } from './types/patients';
import { Resource, Specialty } from './types/resources';
import { ScheduleRangeType, ScheduleRecord } from './types/schedules';
import { Appointment } from './types/appointments';

export const patients: Patient[] = [
  {
    id: 1,
    fullName: 'Иванов Иван Иванович',
    omsNumber: '1111111111111111',
    dateOfBirth: '2011-11-11',
  },
  {
    id: 2,
    fullName: 'Алексеев Алексей Алексеевич',
    omsNumber: '2222222222222222',
    dateOfBirth: '1922-12-22',
  },
  {
    id: 3,
    fullName: 'Петров Петр Петрович',
    omsNumber: '3333333333333333',
    dateOfBirth: '1990-01-01',
  },
  {
    id: 4,
    fullName: 'Сергеев Сергей Сергеевич',
    omsNumber: '4444444444444444',
    dateOfBirth: '2002-02-02',
  },
  {
    id: 5,
    fullName: 'Васильев Василий Васильевич',
    omsNumber: '5555555555555555',
    dateOfBirth: '1949-09-09',
  },
];

export const resources: Resource[] = [
  {
    id: 1,
    fullName: 'Григорьева Г.Г.',
    specialty: Specialty.Therapist,
    specialtyLabel: 'терапевт',
    facility: 'ГП №128',
    office: 'к.110',
  },
  {
    id: 2,
    fullName: 'Сидорова С.С.',
    specialty: Specialty.Therapist,
    specialtyLabel: 'терапевт',
    facility: 'ГП №128',
    office: 'к.120',
  },
  {
    id: 3,
    fullName: 'Сидорова С.С.',
    specialty: Specialty.Therapist,
    specialtyLabel: 'терапевт',
    facility: 'ГП №128',
    office: 'к.130',
  },
  {
    id: 4,
    fullName: 'Елисеева Е.Е.',
    specialty: Specialty.Ophthalmologist,
    specialtyLabel: 'офтальмолог',
    facility: 'ГП №128',
    office: 'к.140',
  },
  {
    id: 5,
    fullName: 'Константинова-Щедрина А.А.',
    specialty: Specialty.Ophthalmologist,
    specialtyLabel: 'офтальмолог',
    facility: 'ГП №128',
    office: 'к.150',
  },
];

export const scheduleRecords: ScheduleRecord[] = [
  {
    id: 1,
    resourceId: 1,
    startDate: '2020-08-24',
    endDate: '2020-10-24',
    workingHours: {
      start: '10:00',
      end: '20:00',
    },
    workingWeekdays: [1, 2, 3, 4, 5],
    intervalDuration: 30,
    ranges: [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '10:00', end: '14:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5],
      },
      {
        id: 102,
        title: 'Запись на прием',
        time: { start: '15:00', end: '20:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5],
      },
      {
        id: 103,
        title: 'Врач не работает',
        time: { start: '14:00', end: '15:00' },
        type: ScheduleRangeType.NotWorking,
        weekdays: [1, 2, 3, 4, 5],
      },
    ],
  },
  {
    id: 2,
    resourceId: 2,
    startDate: '2020-08-24',
    endDate: '2020-10-24',
    workingHours: {
      start: '08:00',
      end: '15:00',
    },
    workingWeekdays: [1, 2, 3, 4],
    intervalDuration: 30,
    ranges: [
      {
        id: 201,
        title: 'Запись на прием',
        time: { start: '10:00', end: '15:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4],
      },
      {
        id: 202,
        title: 'Обучение',
        time: { start: '10:00', end: '15:00' },
        type: ScheduleRangeType.Training,
        weekdays: [1],
      },
    ],
  },
  {
    id: 3,
    resourceId: 3,
    startDate: '2020-08-24',
    endDate: '2020-09-24',
    workingHours: {
      start: '14:00',
      end: '18:00',
    },
    workingWeekdays: [5, 6],
    intervalDuration: 10,
    ranges: [
      {
        id: 301,
        title: 'Запись на прием',
        time: { start: '14:00', end: '18:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [5, 6],
      },
    ],
  },
  {
    id: 4,
    resourceId: 4,
    startDate: '2020-08-24',
    endDate: '2020-10-24',
    workingHours: {
      start: '08:00',
      end: '18:00',
    },
    workingWeekdays: [1, 2, 3, 4, 5],
    intervalDuration: 30,
    ranges: [
      {
        id: 401,
        title: 'Запись на прием',
        time: { start: '10:00', end: '17:45' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5],
      },
      {
        id: 402,
        title: 'Работа с документами',
        time: { start: '14:30', end: '14:55' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5],
      },
      {
        id: 403,
        title: 'Работа с документами',
        time: { start: '16:20', end: '16:40' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5],
      },
    ],
  },
  {
    id: 5,
    resourceId: 5,
    startDate: '2020-08-24',
    endDate: '2020-10-24',
    workingHours: {
      start: '09:00',
      end: '21:00',
    },
    workingWeekdays: [2, 3, 4, 5, 6],
    intervalDuration: 30,
    ranges: [
      {
        id: 501,
        title: 'Запись на прием',
        time: { start: '09:00', end: '21:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [3, 4, 5, 6],
      },
    ],
  },
];

export const appointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    resourceId: 1,
    date: '2020-09-02',
    time: '10:00',
  },
  {
    id: 2,
    patientId: 2,
    resourceId: 1,
    date: '2020-09-02',
    time: '10:00',
  },
  {
    id: 3,
    patientId: 3,
    resourceId: 1,
    date: '2020-09-02',
    time: '10:30',
  },
  {
    id: 4,
    patientId: 4,
    resourceId: 2,
    date: '2020-09-07',
    time: '10:30',
  },
];
