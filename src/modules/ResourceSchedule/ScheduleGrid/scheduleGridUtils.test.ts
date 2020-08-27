import { parseDate } from '../../../utils/dateUtils';
import {
  addOutsideWorkingCells,
  createMapForScheduleRanges,
  findInScheduleRanges,
  getIntervalsForWorkingTime,
  getCellsCountForWorkingTime,
  getDateIntervalForEachCell,
  getScheduleDayCells,
  getScheduleCellsForWorkingTimeInterval,
  isIntersectedAsDeniedInterval,
  mergeScheduleDayCells,
  getOverlappingScheduleInterval,
  filterIntervalDaysByWeekdays,
  parseTimeInterval,
} from './scheduleGridUtils';
import {
  ScheduleDayCell,
  ScheduleRangeType,
  TimeInterval,
  ScheduleRange,
  WorkingWeekdays,
} from '../../../types/schedules';

describe('getOverlappingScheduleInterval', () => {
  it('should be inside interval', () => {
    const expected = {
      start: new Date('2020-07-27T00:00:00'),
      end: new Date('2020-09-30T00:00:00'),
    };

    const result = getOverlappingScheduleInterval(
      { startDate: '2020-07-27', endDate: '2020-09-30' },
      { startDate: '2020-07-27', endDate: '2020-09-30' }
    );

    expect(result).toEqual(expected);
  });

  it('should be inside interval', () => {
    const expectedInterval = {
      start: new Date('2020-09-25T00:00:00'),
      end: new Date('2020-09-30T00:00:00'),
    };

    const resultInterval = getOverlappingScheduleInterval(
      { startDate: '2020-07-27', endDate: '2020-09-30' },
      { startDate: '2020-09-25', endDate: '2020-10-01' }
    );

    expect(resultInterval).toEqual(expectedInterval);
  });

  it('should be inside interval', () => {
    const expectedInterval = {
      start: new Date('2020-07-27T00:00:00'),
      end: new Date('2020-07-27T00:00:00'),
    };

    const resultInterval = getOverlappingScheduleInterval(
      { startDate: '2020-07-27', endDate: '2020-09-30' },
      { startDate: '2020-07-20', endDate: '2020-07-27' }
    );

    expect(resultInterval).toEqual(expectedInterval);
  });

  it('should be inside interval', () => {
    const expectedInterval = {
      start: new Date('2020-07-27T00:00:00'),
      end: new Date('2020-07-29T00:00:00'),
    };

    const resultInterval = getOverlappingScheduleInterval(
      { startDate: '2020-07-27', endDate: '2020-09-30' },
      { startDate: '2020-07-22', endDate: '2020-07-29' }
    );

    expect(resultInterval).toEqual(expectedInterval);
  });
});

describe('filterIntervalDaysByWeekdays', () => {
  it('should correctly filter dates by specified weekday numbers', () => {
    const monday = parseDate('2020-07-27'); // Monday - 1
    const tuesday = parseDate('2020-07-28'); // Tuesday - 2
    const wednesday = parseDate('2020-07-29'); // Wednesday - 3
    const thursday = parseDate('2020-07-30'); // Thursday - 4

    const intervalDays = [monday, tuesday, wednesday, thursday];

    const result = filterIntervalDaysByWeekdays(intervalDays, [1, 2]);

    expect(result).toEqual([monday, tuesday]);
  });

  it('should correctly filter list of dates by specified weekday numbers', () => {
    const monday = parseDate('2020-07-27'); // Monday - 1
    const tuesday = parseDate('2020-07-28'); // Tuesday - 2
    const wednesday = parseDate('2020-07-29'); // Wednesday - 3
    const thursday = parseDate('2020-07-30'); // Thursday - 4
    const friday = parseDate('2020-07-31'); // Friday - 5
    const saturday = parseDate('2020-08-01'); // Saturday - 6
    const sunday = parseDate('2020-08-02'); // Sunday - 0

    const intervalDays = [
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    ];

    const expected = [monday, friday, saturday, sunday];

    const result = filterIntervalDaysByWeekdays(intervalDays, [5, 6, 0, 1]);

    expect(result).toEqual(expected);
  });
});

describe('parseTimeInterval', () => {
  it('should correctly parse and return date interval object for working time', () => {
    const workingHours = {
      start: '08:00',
      end: '15:00',
    };
    const day = new Date('2020-07-27T00:00:00');

    const expected = {
      start: new Date('2020-07-27T08:00:00'),
      end: new Date('2020-07-27T15:00:00'),
    };

    const result = parseTimeInterval(workingHours, day);

    expect(result).toEqual(expected);
  });
});

describe('getCellsCountForWorkingTime', () => {
  it('should return correct count between dates where fits an integer number of intervals', () => {
    const start = new Date('2020-07-27T10:00:00Z');
    const end = new Date('2020-07-27T15:30:00Z');
    const intervalDuration = 30;
    const expected = 11;

    const result = getCellsCountForWorkingTime(
      { start, end },
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return correct count of cells with partially included interval', () => {
    const start = new Date('2020-07-27T12:00:00Z');
    const end = new Date('2020-07-27T15:40:00Z');
    const intervalDuration = 30;
    const expected = 8;

    const result = getCellsCountForWorkingTime(
      { start, end },
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return correct count of cells with 10 min interval duration', () => {
    const start = new Date('2020-07-27T11:00:00Z');
    const end = new Date('2020-07-27T14:25:00Z');
    const intervalDuration = 10;
    const expected = 21;

    const result = getCellsCountForWorkingTime(
      { start, end },
      intervalDuration
    );

    expect(result).toEqual(expected);
  });
});

describe('getDateIntervalForEachCell', () => {
  it('should return correct list of date intervals for specified params', () => {
    const start = new Date('2020-07-27T10:00:00Z');
    const cellsCount = 3;
    const intervalDuration = 30;

    const expected = [
      {
        start: new Date('2020-07-27T10:00:00Z'),
        end: new Date('2020-07-27T10:29:59Z'),
      },
      {
        start: new Date('2020-07-27T10:30:00Z'),
        end: new Date('2020-07-27T10:59:59Z'),
      },
      {
        start: new Date('2020-07-27T11:00:00Z'),
        end: new Date('2020-07-27T11:29:59Z'),
      },
    ];

    const result = getDateIntervalForEachCell(
      cellsCount,
      start,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return list of intervals for 15 min interval duration', () => {
    const start = new Date('2020-07-27T08:30:00Z');
    const cellsCount = 4;
    const intervalDuration = 15;

    const expected = [
      {
        start: new Date('2020-07-27T08:30:00Z'),
        end: new Date('2020-07-27T08:44:59Z'),
      },
      {
        start: new Date('2020-07-27T08:45:00Z'),
        end: new Date('2020-07-27T08:59:59Z'),
      },
      {
        start: new Date('2020-07-27T09:00:00Z'),
        end: new Date('2020-07-27T09:14:59Z'),
      },
      {
        start: new Date('2020-07-27T09:15:00Z'),
        end: new Date('2020-07-27T09:29:59Z'),
      },
    ];

    const result = getDateIntervalForEachCell(
      cellsCount,
      start,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });
});

describe('getIntervalsForWorkingTime', () => {
  it('should return list of intervals for specified working time and 30 min interval duration', () => {
    const workingHours = {
      start: '08:00',
      end: '15:00',
    };
    const day = new Date('2020-07-27T10:00:00');
    const intervalDuration = 30;

    const expected = [
      {
        start: new Date('2020-07-27T08:00:00'),
        end: new Date('2020-07-27T08:29:59'),
      },
      {
        start: new Date('2020-07-27T08:30:00'),
        end: new Date('2020-07-27T08:59:59'),
      },
      {
        start: new Date('2020-07-27T09:00:00'),
        end: new Date('2020-07-27T09:29:59'),
      },
      {
        start: new Date('2020-07-27T09:30:00'),
        end: new Date('2020-07-27T09:59:59'),
      },
      {
        start: new Date('2020-07-27T10:00:00'),
        end: new Date('2020-07-27T10:29:59'),
      },
      {
        start: new Date('2020-07-27T10:30:00'),
        end: new Date('2020-07-27T10:59:59'),
      },
      {
        start: new Date('2020-07-27T11:00:00'),
        end: new Date('2020-07-27T11:29:59'),
      },
      {
        start: new Date('2020-07-27T11:30:00'),
        end: new Date('2020-07-27T11:59:59'),
      },
      {
        start: new Date('2020-07-27T12:00:00'),
        end: new Date('2020-07-27T12:29:59'),
      },
      {
        start: new Date('2020-07-27T12:30:00'),
        end: new Date('2020-07-27T12:59:59'),
      },
      {
        start: new Date('2020-07-27T13:00:00'),
        end: new Date('2020-07-27T13:29:59'),
      },
      {
        start: new Date('2020-07-27T13:30:00'),
        end: new Date('2020-07-27T13:59:59'),
      },
      {
        start: new Date('2020-07-27T14:00:00'),
        end: new Date('2020-07-27T14:29:59'),
      },
      {
        start: new Date('2020-07-27T14:30:00'),
        end: new Date('2020-07-27T14:59:59'),
      },
    ];

    const result = getIntervalsForWorkingTime(
      workingHours,
      day,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return list of intervals for 10 min interval duration', () => {
    const workingHours = {
      start: '08:00',
      end: '10:20',
    };
    const day = new Date('2020-07-27T10:00:00');
    const intervalDuration = 10;

    const expected = [
      {
        start: new Date('2020-07-27T08:00:00'),
        end: new Date('2020-07-27T08:09:59'),
      },
      {
        start: new Date('2020-07-27T08:10:00'),
        end: new Date('2020-07-27T08:19:59'),
      },
      {
        start: new Date('2020-07-27T08:20:00'),
        end: new Date('2020-07-27T08:29:59'),
      },
      {
        start: new Date('2020-07-27T08:30:00'),
        end: new Date('2020-07-27T08:39:59'),
      },
      {
        start: new Date('2020-07-27T08:40:00'),
        end: new Date('2020-07-27T08:49:59'),
      },
      {
        start: new Date('2020-07-27T08:50:00'),
        end: new Date('2020-07-27T08:59:59'),
      },
      {
        start: new Date('2020-07-27T09:00:00'),
        end: new Date('2020-07-27T09:09:59'),
      },
      {
        start: new Date('2020-07-27T09:10:00'),
        end: new Date('2020-07-27T09:19:59'),
      },
      {
        start: new Date('2020-07-27T09:20:00'),
        end: new Date('2020-07-27T09:29:59'),
      },
      {
        start: new Date('2020-07-27T09:30:00'),
        end: new Date('2020-07-27T09:39:59'),
      },
      {
        start: new Date('2020-07-27T09:40:00'),
        end: new Date('2020-07-27T09:49:59'),
      },
      {
        start: new Date('2020-07-27T09:50:00'),
        end: new Date('2020-07-27T09:59:59'),
      },
      {
        start: new Date('2020-07-27T10:00:00'),
        end: new Date('2020-07-27T10:09:59'),
      },
      {
        start: new Date('2020-07-27T10:10:00'),
        end: new Date('2020-07-27T10:19:59'),
      },
    ];

    const result = getIntervalsForWorkingTime(
      workingHours,
      day,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return list of intervals for working hours that partially include the last of them', () => {
    const workingHours = {
      start: '08:00',
      end: '10:20',
    };
    const day = new Date('2020-07-27T10:00:00');
    const intervalDuration = 30;

    const expected = [
      {
        start: new Date('2020-07-27T08:00:00'),
        end: new Date('2020-07-27T08:29:59'),
      },
      {
        start: new Date('2020-07-27T08:30:00'),
        end: new Date('2020-07-27T08:59:59'),
      },
      {
        start: new Date('2020-07-27T09:00:00'),
        end: new Date('2020-07-27T09:29:59'),
      },
      {
        start: new Date('2020-07-27T09:30:00'),
        end: new Date('2020-07-27T09:59:59'),
      },
      {
        start: new Date('2020-07-27T10:00:00'),
        end: new Date('2020-07-27T10:29:59'),
      },
    ];

    const result = getIntervalsForWorkingTime(
      workingHours,
      day,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });
});

describe('findInScheduleRanges', () => {
  it('should find interval start date in specific schedule range', () => {
    const dateToFind = new Date('2020-07-27T16:30:00');

    const ranges = [
      {
        id: 402,
        title: 'Работа с документами',
        time: { start: '14:30', end: '14:55' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
      {
        id: 403,
        title: 'Работа с документами',
        time: { start: '16:20', end: '16:40' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const day = new Date('2020-07-27T10:00:00');
    const scheduleRangesMap = createMapForScheduleRanges(ranges, day);

    const foundRangeKey = findInScheduleRanges(dateToFind, scheduleRangesMap);
    const foundRange = scheduleRangesMap.get(foundRangeKey);

    const expectedInterval = {
      start: new Date('2020-07-27T16:20:00'),
      end: new Date('2020-07-27T16:39:59'),
    };

    const expectedRange = ranges[1];

    expect(foundRangeKey).toEqual(expectedInterval);
    expect(foundRange).toEqual(expectedRange);
  });

  it('should not find interval start date in the specific schedule range', () => {
    const dateToFind = new Date('2020-07-27T17:00:00');

    const ranges = [
      {
        id: 403,
        title: 'Работа с документами',
        time: { start: '16:30', end: '17:00' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const day = new Date('2020-07-27T10:00:00');
    const rangesMap = createMapForScheduleRanges(ranges, day);

    const foundRangeKey = findInScheduleRanges(dateToFind, rangesMap);

    const expected = undefined;

    expect(foundRangeKey).toEqual(expected);
  });

  it('should find interval end date in specific schedule range', () => {
    const endDateToFind = new Date('2020-07-27T16:59:59');

    const ranges = [
      {
        id: 403,
        title: 'Работа с документами',
        time: { start: '16:30', end: '17:00' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const day = new Date('2020-07-27T10:00:00');
    const scheduleRangesMap = createMapForScheduleRanges(ranges, day);

    const foundRangeKey = findInScheduleRanges(
      endDateToFind,
      scheduleRangesMap
    );
    const foundRange = scheduleRangesMap.get(foundRangeKey);

    const expected = {
      start: new Date('2020-07-27T16:30:00'),
      end: new Date('2020-07-27T16:59:59'),
    };
    const expectedRange = ranges[0];

    expect(foundRangeKey).toEqual(expected);
    expect(foundRange).toEqual(expectedRange);
  });

  it('should find the date in the schedule range with the same start date', () => {
    const dateToFind = new Date('2020-07-27T16:00:00');

    const ranges = [
      {
        id: 403,
        title: 'Работа с документами',
        time: { start: '16:00', end: '16:30' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const day = new Date('2020-07-27T10:00:00');
    const rangesMap = createMapForScheduleRanges(ranges, day);

    const foundRangeKey = findInScheduleRanges(dateToFind, rangesMap);

    const expected = {
      start: new Date('2020-07-27T16:00:00'),
      end: new Date('2020-07-27T16:29:59'),
    };

    expect(foundRangeKey).toEqual(expected);
  });
});

describe('getScheduleCellsForWorkingTimeInterval', () => {
  it('should return NoAppointment and Training schedule cells when end of interval is within a denied range and more than 20% intersected', () => {
    const cellInterval = {
      start: new Date('2020-07-27T16:00:00'),
      end: new Date('2020-07-27T16:29:59'),
    };
    const baseDate = new Date('2020-07-27T10:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:20', end: '17:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T16:00:00'),
          end: new Date('2020-07-27T16:19:59'),
        },
      },
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:20:00'),
          end: new Date('2020-07-27T16:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return Training and NoAppointment cells if start of interval is in a denied range', () => {
    const cellInterval = {
      start: new Date('2020-07-27T17:00:00'),
      end: new Date('2020-07-27T17:29:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:20', end: '17:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T17:00:00'),
          end: new Date('2020-07-27T17:04:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T17:05:00'),
          end: new Date('2020-07-27T17:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return single Training cell for interval that starts and ends at that Training range', () => {
    const cellInterval = {
      start: new Date('2020-07-27T16:30:00'),
      end: new Date('2020-07-27T16:59:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:20', end: '17:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:30:00'),
          end: new Date('2020-07-27T16:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return Training cell for interval with its end and start dates within that denied range', () => {
    const interval = {
      start: new Date('2020-07-27T16:30:00'),
      end: new Date('2020-07-27T16:59:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:20', end: '17:00' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:30:00'),
          end: new Date('2020-07-27T16:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return the cell with denied range type for interval which start and end dates are the same as the range', () => {
    const cellInterval = {
      start: new Date('2020-07-27T16:30:00'),
      end: new Date('2020-07-27T16:59:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:30', end: '17:00' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:30:00'),
          end: new Date('2020-07-27T16:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return Training and NoAppointment cells for the interval which start date is within the range but end date is out of the one', () => {
    const cellInterval = {
      start: new Date('2020-07-27T16:30:00'),
      end: new Date('2020-07-27T16:59:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:20', end: '16:55' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:30:00'),
          end: new Date('2020-07-27T16:54:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T16:55:00'),
          end: new Date('2020-07-27T16:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return allowed appointment cell for the interval that is within an allowed range and not intersected with denied one', () => {
    const cellInterval = {
      start: new Date('2020-07-27T17:30:00'),
      end: new Date('2020-07-27T17:59:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:20', end: '17:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 101,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T17:30:00'),
          end: new Date('2020-07-27T17:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return Working and Training cells for the interval which end starts at denied range but not greater than 20%', () => {
    const cellInterval = {
      start: new Date('2020-07-27T16:30:00'),
      end: new Date('2020-07-27T16:59:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '16:55', end: '17:40' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 101,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T16:30:00'),
          end: new Date('2020-07-27T16:54:59'),
        },
      },
      {
        rangeId: 403,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:55:00'),
          end: new Date('2020-07-27T16:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      cellInterval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should create single NoAppointment cell for the interval which includes denied range', () => {
    const interval = {
      start: new Date('2020-07-27T15:00:00'),
      end: new Date('2020-07-27T15:29:59'),
    };
    const baseDate = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 403,
        title: 'Обучение',
        time: { start: '15:10', end: '15:25' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, baseDate);
    const allowedRangesMap = createMapForScheduleRanges(
      allowedRanges,
      baseDate
    );

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should create NoAppointment cell for the interval which end time is not in an allowed range greater than 20%', () => {
    const interval = {
      start: new Date('2020-07-27T17:30:00'),
      end: new Date('2020-07-27T17:59:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '10:00', end: '17:45' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 402,
        title: 'Работа с документами',
        time: { start: '14:30', end: '14:55' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T17:30:00'),
          end: new Date('2020-07-27T17:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should create Working and NoAppointment cells for interval which end time is not in an allowed range less than 20%', () => {
    const interval = {
      start: new Date('2020-07-27T17:30:00'),
      end: new Date('2020-07-27T17:59:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '10:00', end: '17:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges = [
      {
        id: 402,
        title: 'Работа с документами',
        time: { start: '14:30', end: '14:55' },
        type: ScheduleRangeType.PaperWorking,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 101,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T17:30:00'),
          end: new Date('2020-07-27T17:54:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T17:55:00'),
          end: new Date('2020-07-27T17:59:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return allowed cell if there is no denied ranges', () => {
    const interval = {
      start: new Date('2020-07-27T15:00:00'),
      end: new Date('2020-07-27T15:29:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 101,
        title: 'Запись на прием',
        time: { start: '10:00', end: '18:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5] as WorkingWeekdays[],
      },
    ];
    const deniedRanges: ScheduleRange[] = [];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 101,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should create denied cell if the interval is in an allowed range but also in a denied range', () => {
    const interval = {
      start: new Date('2020-07-27T10:00:00'),
      end: new Date('2020-07-27T10:29:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges = [
      {
        id: 201,
        title: 'Запись на прием',
        time: { start: '10:00', end: '15:00' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4] as WorkingWeekdays[],
      },
    ];
    const deniedRanges: ScheduleRange[] = [
      {
        id: 202,
        title: 'Обучение',
        time: { start: '10:00', end: '15:00' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T10:00:00'),
          end: new Date('2020-07-27T10:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return denied cell for interval within denied range and if there is no allowed ranges', () => {
    const interval = {
      start: new Date('2020-07-27T12:00:00'),
      end: new Date('2020-07-27T12:29:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges: ScheduleRange[] = [];
    const deniedRanges: ScheduleRange[] = [
      {
        id: 202,
        title: 'Обучение',
        time: { start: '10:00', end: '15:00' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4] as WorkingWeekdays[],
      },
    ];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T12:00:00'),
          end: new Date('2020-07-27T12:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should return NoAppointment cell for the interval that starts not at an allowed range', () => {
    const interval = {
      start: new Date('2020-07-27T14:00:00'),
      end: new Date('2020-07-27T14:29:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges: ScheduleRange[] = [
      {
        id: 201,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5],
      },
    ] as ScheduleRange[];

    const deniedRanges: ScheduleRange[] = [
      {
        id: 202,
        title: 'Обучение',
        time: { start: '16:20', end: '17:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5],
      },
    ] as ScheduleRange[];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T14:00:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });

  it('should create NoAppointment and Training cells for the interval which starts not at an allowed range and ends at a denied one', () => {
    const interval = {
      start: new Date('2020-07-27T14:00:00'),
      end: new Date('2020-07-27T14:29:59'),
    };
    const date = new Date('2020-07-27T08:00:00');
    const intervalDuration = 30;
    const allowedRanges: ScheduleRange[] = [
      {
        id: 201,
        title: 'Запись на прием',
        time: { start: '15:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5],
      },
    ] as ScheduleRange[];

    const deniedRanges: ScheduleRange[] = [
      {
        id: 202,
        title: 'Обучение',
        time: { start: '14:20', end: '15:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5],
      },
    ] as ScheduleRange[];

    const deniedRangesMap = createMapForScheduleRanges(deniedRanges, date);
    const allowedRangesMap = createMapForScheduleRanges(allowedRanges, date);

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T14:00:00'),
          end: new Date('2020-07-27T14:19:59'),
        },
      },
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T14:20:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
    ];

    const result = getScheduleCellsForWorkingTimeInterval(
      interval,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });
});

describe('isIntersectedAsDeniedInterval', () => {
  it('should return true if intervals are greater than 20% intersected', () => {
    const endOfInterval = new Date('2020-07-27T16:29:59');
    const startOfDeniedRange = new Date('2020-07-27T16:20:00');
    const intervalDuration = 30;

    const result = isIntersectedAsDeniedInterval(
      endOfInterval,
      startOfDeniedRange,
      intervalDuration
    );

    expect(result).toBe(true);
  });

  it('should return false if intervals are less than 20% intersected', () => {
    const endOfInterval = new Date('2020-07-27T16:29:59');
    const startOfDeniedRange = new Date('2020-07-27T16:25:00');
    const intervalDuration = 30;

    const result = isIntersectedAsDeniedInterval(
      endOfInterval,
      startOfDeniedRange,
      intervalDuration
    );

    expect(result).toBe(false);
  });
});

describe('getScheduleDayCells', () => {
  it('should return a set of schedule cells for working day intervals', () => {
    const date = new Date('2020-07-27T08:00:00');
    const workingHours = {
      start: '14:00',
      end: '20:00',
    };
    const intervalDuration = 30;
    const scheduleRanges: ScheduleRange[] = [
      {
        id: 201,
        title: 'Запись на прием',
        time: { start: '14:20', end: '19:55' },
        type: ScheduleRangeType.AllowAppointment,
        weekdays: [1, 2, 3, 4, 5],
      },
      {
        id: 202,
        title: 'Обучение',
        time: { start: '16:20', end: '17:05' },
        type: ScheduleRangeType.Training,
        weekdays: [1, 2, 3, 4, 5],
      },
    ];

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.OutsideWorking,
        interval: {
          start: new Date('2020-07-27T08:00:00'),
          end: new Date('2020-07-27T13:59:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T14:00:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T14:30:00'),
          end: new Date('2020-07-27T14:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:30:00'),
          end: new Date('2020-07-27T15:59:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T16:00:00'),
          end: new Date('2020-07-27T16:19:59'),
        },
      },
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:20:00'),
          end: new Date('2020-07-27T17:04:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T17:05:00'),
          end: new Date('2020-07-27T17:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T17:30:00'),
          end: new Date('2020-07-27T17:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T18:00:00'),
          end: new Date('2020-07-27T18:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T18:30:00'),
          end: new Date('2020-07-27T18:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T19:00:00'),
          end: new Date('2020-07-27T19:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T19:30:00'),
          end: new Date('2020-07-27T19:54:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T19:55:00'),
          end: new Date('2020-07-27T19:59:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.OutsideWorking,
        interval: {
          start: new Date('2020-07-27T20:00:00'),
          end: new Date('2020-07-27T20:59:59'),
        },
      },
    ];

    const result = getScheduleDayCells(
      date,
      workingHours,
      scheduleRanges,
      intervalDuration
    );

    expect(result).toEqual(expected);
  });
});

describe('mergeScheduleDayCells', () => {
  it('should properly merge adjacent cells with the same appointment denied types', () => {
    const cells: ScheduleDayCell[] = [
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:20:00'),
          end: new Date('2020-07-27T16:29:59'),
        },
      },
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:30:00'),
          end: new Date('2020-07-27T16:59:59'),
        },
      },
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T17:00:00'),
          end: new Date('2020-07-27T17:04:59'),
        },
      },
    ];

    const expected: ScheduleDayCell[] = [
      {
        rangeId: 202,
        rangeType: ScheduleRangeType.Training,
        interval: {
          start: new Date('2020-07-27T16:20:00'),
          end: new Date('2020-07-27T17:04:59'),
        },
      },
    ];

    expect(mergeScheduleDayCells(cells)).toEqual(expected);
  });

  it('should properly merge adjacent cells with NoAppointment type', () => {
    const cells: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T13:50:00'),
          end: new Date('2020-07-27T13:59:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T14:00:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T14:30:00'),
          end: new Date('2020-07-27T14:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
    ];

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T13:50:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T14:30:00'),
          end: new Date('2020-07-27T14:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
    ];

    expect(mergeScheduleDayCells(cells)).toEqual(expected);
  });
});

describe('addOutsideWorkingCells', () => {
  it('should add outside working cells to recourse schedule with appropriate time', () => {
    const workingTime: TimeInterval = {
      start: '08:00',
      end: '21:00',
    };
    const date = new Date('2020-07-27T10:00:00');
    const cells: ScheduleDayCell[] = [
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T12:30:00'),
          end: new Date('2020-07-27T12:59:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T13:00:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T14:30:00'),
          end: new Date('2020-07-27T14:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
    ];

    const expected: ScheduleDayCell[] = [
      {
        rangeId: null,
        rangeType: ScheduleRangeType.OutsideWorking,
        interval: {
          start: new Date('2020-07-27T08:00:00'),
          end: new Date('2020-07-27T12:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T12:30:00'),
          end: new Date('2020-07-27T12:59:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.NoAppointment,
        interval: {
          start: new Date('2020-07-27T13:00:00'),
          end: new Date('2020-07-27T14:29:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T14:30:00'),
          end: new Date('2020-07-27T14:59:59'),
        },
      },
      {
        rangeId: 201,
        rangeType: ScheduleRangeType.AllowAppointment,
        interval: {
          start: new Date('2020-07-27T15:00:00'),
          end: new Date('2020-07-27T15:29:59'),
        },
      },
      {
        rangeId: null,
        rangeType: ScheduleRangeType.OutsideWorking,
        interval: {
          start: new Date('2020-07-27T15:30:00'),
          end: new Date('2020-07-27T20:59:59'),
        },
      },
    ];

    const result = addOutsideWorkingCells(cells, workingTime, date);

    expect(result).toEqual(expected);
  });
});
