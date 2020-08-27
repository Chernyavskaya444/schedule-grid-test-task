import {
  add,
  addMinutes,
  addSeconds,
  compareAsc,
  differenceInMinutes,
  eachDayOfInterval,
  getDay,
  isAfter,
  isBefore,
  isWithinInterval,
  subSeconds,
} from 'date-fns';
import {
  formatDate,
  formatTime,
  parseDate,
  parseTime,
} from '../../../utils/dateUtils';
import {
  DateInterval,
  ScheduleDayCell,
  ScheduleDay,
  ResourceScheduleDay,
  ScheduleRangeType,
  ScheduleRecord,
  TimeInterval,
  ScheduleRange,
  WorkingWeekdays,
} from '../../../types/schedules';
import { Resource } from '../../../types/resources';
import { getRecordsKeyedById } from '../../../utils/recordUtils';
import { getScheduleDayKey } from '../../../utils/scheduleUtils';
import {
  ALLOWABLE_INTERSECTION_PERCENTS,
  CAPTION_DATE_FORMAT,
  FACILITY_WORKING_TIME,
} from '../../../constants/schedules';

type MapIntervalScheduleRange = Map<Interval, ScheduleRange>;

export const formatScheduleDayCaption = (date: Date) => {
  return formatDate(date, CAPTION_DATE_FORMAT);
};

export const formatScheduleSummary = (
  date: Date,
  scheduleRecord: ScheduleRecord
) => {
  const ranges = getAppliedRangesByWeekday(scheduleRecord, getDay(date));
  const deniedRanges = getDeniedAppointmentRanges(ranges);
  const { start, end } = scheduleRecord.workingHours;
  const workingHoursItem = `${start}-${end}`;

  return deniedRanges.reduce(
    (result, item) => {
      result.push(item.title);
      result.push(`(${item.time.start}-${item.time.end})`);
      return result;
    },
    [workingHoursItem]
  );
};

export const formatCellIntervalTime = (interval: Interval) => {
  return `${formatTime(interval.start)} - ${formatTime(
    addSeconds(interval.end, 1)
  )}`;
};

export const getScheduleDays = (
  scheduleRecords: ScheduleRecord[],
  dateRange: DateInterval
): ScheduleDay[] => {
  return scheduleRecords.reduce<ScheduleDay[]>((result, record) => {
    const {
      startDate,
      endDate,
      intervalDuration,
      workingHours,
      workingWeekdays,
    } = record;

    const scheduledInterval = getOverlappingScheduleInterval({ startDate, endDate }, dateRange);
    const allIntervalDays = eachDayOfInterval(scheduledInterval);
    const scheduledDays = filterIntervalDaysByWeekdays(allIntervalDays, workingWeekdays);

    const scheduleDayRecords = scheduledDays.map<ScheduleDay>((day) => {
      const ranges = getAppliedRangesByWeekday(record, getDay(day));
      const scheduleCells = getScheduleDayCells(day, workingHours, ranges, intervalDuration);
      const scheduleDayKey = getScheduleDayKey(day, record.resourceId);

      return {
        scheduleCells,
        scheduleDayKey,
        date: day,
        resourceId: record.resourceId,
        scheduleRecord: record,
      };
    });

    return [...result, ...scheduleDayRecords];
  }, []);
};

export const getResourceScheduleDays = (
  scheduleRecords: ScheduleRecord[],
  dateRange: DateInterval,
  resources: Resource[]
): ResourceScheduleDay[] => {
  const scheduleDays = getScheduleDays(scheduleRecords, dateRange);
  const resourceScheduleDays = getScheduleDaysWithResources(
    scheduleDays,
    resources
  );
  return sortScheduleDayRecords(resourceScheduleDays);
};

const getScheduleDaysWithResources = (
  scheduleRecords: ScheduleDay[],
  resources: Resource[]
): ResourceScheduleDay[] => {
  const resourcesKeyedById = getRecordsKeyedById(resources);

  return scheduleRecords.map<ResourceScheduleDay>((item) => ({
    ...item,
    resource: resourcesKeyedById[item.resourceId],
  }));
};

export const filterIntervalDaysByWeekdays = (
  intervalDays: Date[],
  weekdays: number[]
) => {
  return intervalDays.filter((day) => weekdays.includes(getDay(day)));
};

export const getAppliedRangesByWeekday = (
  scheduleRecord: ScheduleRecord,
  weekday: WorkingWeekdays
) => {
  const { ranges } = scheduleRecord;
  return ranges.filter(({ weekdays }) => weekdays.includes(weekday));
};

export const getScheduleDayCells = (
  day: Date,
  workingHours: TimeInterval,
  ranges: ScheduleRange[],
  intervalDuration: number
) => {
  const workingTimeIntervals: Interval[] = getIntervalsForWorkingTime(
    workingHours,
    day,
    intervalDuration
  );
  const allowedRanges = getAllowAppointmentRanges(ranges);
  const deniedRanges = getDeniedAppointmentRanges(ranges);
  const allowedRangesMap = createMapForScheduleRanges(allowedRanges, day);
  const deniedRangesMap = createMapForScheduleRanges(deniedRanges, day);

  let scheduleDayCells: ScheduleDayCell[] = workingTimeIntervals.reduce<
    ScheduleDayCell[]
  >((result, item) => {
    const intervalScheduleCells = getScheduleCellsForWorkingTimeInterval(
      item,
      allowedRangesMap,
      deniedRangesMap,
      intervalDuration
    );
    return result.concat(intervalScheduleCells);
  }, []);

  scheduleDayCells = mergeScheduleDayCells(scheduleDayCells);
  return addOutsideWorkingCells(scheduleDayCells, FACILITY_WORKING_TIME, day);
};

export const getScheduleCellsForWorkingTimeInterval = (
  interval: Interval,
  allowedRanges: MapIntervalScheduleRange,
  deniedRanges: MapIntervalScheduleRange,
  intervalDuration: number
): ScheduleDayCell[] => {
  const { start, end } = interval;

  const foundStartInDeniedRange = findInScheduleRanges(start, deniedRanges);
  const foundStartInAllowedRange = findInScheduleRanges(start, allowedRanges);

  if (!foundStartInDeniedRange && foundStartInAllowedRange) {
    if (findRangesWithinInterval(interval, deniedRanges)) {
      return [createNoAppointmentCell(interval)];
    }
    const foundEndInDeniedRange = findInScheduleRanges(end, deniedRanges);
    if (foundEndInDeniedRange) {
      if (
        isIntersectedAsDeniedInterval(
          end,
          foundEndInDeniedRange.start,
          intervalDuration
        )
      ) {
        const intersectedDeniedRange = deniedRanges.get(foundEndInDeniedRange);

        return [
          createNoAppointmentCell({
            start,
            end: createEndDateFromStart(foundEndInDeniedRange.start),
          }),
          createScheduleCellForInterval(
            { start: foundEndInDeniedRange.start, end },
            intersectedDeniedRange!
          ),
        ];
      } else {
        const allowedRange = allowedRanges.get(foundStartInAllowedRange);
        const deniedRange = deniedRanges.get(foundEndInDeniedRange);

        return [
          createScheduleCellForInterval(
            { start, end: createEndDateFromStart(foundEndInDeniedRange.start) },
            allowedRange!
          ),
          createScheduleCellForInterval(
            { start: foundEndInDeniedRange.start, end },
            deniedRange!
          ),
        ];
      }
    } else {
      const foundEndInAllowedRange = findInScheduleRanges(end, allowedRanges);
      const allowedRange = allowedRanges.get(foundStartInAllowedRange);
      if (foundEndInAllowedRange) {
        return [createScheduleCellForInterval(interval, allowedRange!)];
      } else {
        const isDeniedForAppointment = isIntersectedAsDeniedInterval(
          end,
          foundStartInAllowedRange.end,
          intervalDuration
        );
        if (isDeniedForAppointment) {
          return [createNoAppointmentCell(interval)];
        } else {
          return [
            createScheduleCellForInterval(
              { start, end: foundStartInAllowedRange.end },
              allowedRange!
            ),
            createNoAppointmentCell({
              start: createStartDateFromEnd(foundStartInAllowedRange.end),
              end,
            }),
          ];
        }
      }
    }
  } else if (foundStartInDeniedRange) {
    const foundEndInDeniedRange = findInScheduleRanges(end, deniedRanges);
    const deniedRange = deniedRanges.get(foundStartInDeniedRange);

    if (foundEndInDeniedRange) {
      return [createScheduleCellForInterval(interval, deniedRange!)];
    } else {
      return [
        createScheduleCellForInterval(
          { start, end: foundStartInDeniedRange.end },
          deniedRange!
        ),
        createNoAppointmentCell({
          start: createStartDateFromEnd(foundStartInDeniedRange.end),
          end,
        }),
      ];
    }
  } else if (!foundStartInAllowedRange) {
    const foundEndInDeniedRange = findInScheduleRanges(end, deniedRanges);

    if (foundEndInDeniedRange) {
      const deniedRange = deniedRanges.get(foundEndInDeniedRange);
      return [
        createNoAppointmentCell({
          start,
          end: createEndDateFromStart(foundEndInDeniedRange.start),
        }),
        createScheduleCellForInterval(
          { start: foundEndInDeniedRange.start, end },
          deniedRange!
        ),
      ];
    } else {
      return [createNoAppointmentCell(interval)];
    }
  }

  return [];
};

export const mergeScheduleDayCells = (intervalCells: ScheduleDayCell[]) => {
  return intervalCells.reduce<ScheduleDayCell[]>((result, item) => {
    const lastItem = result.length > 0 && result[result.length - 1];

    if (lastItem && isSameDeniedScheduleCells(lastItem, item)) {
      result[result.length - 1] = mergeDeniedScheduleCells(lastItem, item);
    } else {
      result.push(item);
    }
    return result;
  }, []);
};

export const addOutsideWorkingCells = (
  intervalCells: ScheduleDayCell[],
  workingTime: TimeInterval,
  day: Date
) => {
  if (!intervalCells.length) {
    return intervalCells;
  }
  const firstCell = intervalCells[0];
  const lastCell = intervalCells[intervalCells.length - 1];
  const { start, end } = parseTimeInterval(workingTime, day);
  const startOfCells = firstCell.interval.start;
  const endOfCells = createStartDateFromEnd(lastCell.interval.end);
  const shouldAddToStart = isBefore(start, startOfCells);
  const shouldAddToEnd = isAfter(end, endOfCells);

  let result = [];
  if (shouldAddToStart) {
    result.push(
      createOutsideWorkingCell({
        start,
        end: createEndDateFromStart(startOfCells),
      })
    );
  }
  result = result.concat(intervalCells);
  if (shouldAddToEnd) {
    result.push(
      createOutsideWorkingCell({
        start: endOfCells,
        end: createEndDateFromStart(end),
      })
    );
  }

  return result;
};

export const getIntervalsForWorkingTime = (
  workingHours: TimeInterval,
  day: Date,
  intervalDuration: number
) => {
  const workingHoursInterval = parseTimeInterval(workingHours, day);
  const cellsCount = getCellsCountForWorkingTime(
    workingHoursInterval,
    intervalDuration
  );
  return getDateIntervalForEachCell(
    cellsCount,
    workingHoursInterval.start,
    intervalDuration
  );
};

export const parseTimeInterval = (
  { start, end }: TimeInterval,
  baseDate: Date
): Interval => ({
  start: parseTime(start, baseDate),
  end: parseTime(end, baseDate),
});

export const getCellsCountForWorkingTime = (
  workingHoursDate: Interval,
  intervalDuration: number
) => {
  return Math.ceil(
    differenceInMinutes(workingHoursDate.end, workingHoursDate.start) /
      intervalDuration
  );
};

export const getDateIntervalForEachCell = (
  cellsCount: number,
  startDate: Date | number,
  intervalDuration: number
): Interval[] => {
  return [...new Array(cellsCount)].map<Interval>((item, index) => {
    const start = addMinutes(startDate, intervalDuration * index);
    const end = add(start, { minutes: intervalDuration - 1, seconds: 59 });
    return { start, end };
  });
};

export const getOverlappingScheduleInterval = (
  scheduleRecordDates: DateInterval,
  dateRange: DateInterval
): Interval => {
  const {
    startDate: startOfSchedule,
    endDate: endOfSchedule,
  } = scheduleRecordDates;
  const { startDate: startOfInterval, endDate: endOfInterval } = dateRange;
  const startOfScheduleDate = parseDate(startOfSchedule);
  const endOfScheduleDate = parseDate(endOfSchedule);
  let startOfIntervalDate = parseDate(startOfInterval);
  let endOfIntervalDate = parseDate(endOfInterval);

  if (
    !isWithinInterval(startOfIntervalDate, {
      start: startOfScheduleDate,
      end: endOfScheduleDate,
    })
  ) {
    startOfIntervalDate = startOfScheduleDate;
  }

  if (
    !isWithinInterval(endOfIntervalDate, {
      start: startOfScheduleDate,
      end: endOfScheduleDate,
    })
  ) {
    endOfIntervalDate = endOfScheduleDate;
  }

  return {
    start: startOfIntervalDate,
    end: endOfIntervalDate,
  };
};

const sortScheduleDayRecords = (records: ResourceScheduleDay[]) => {
  return records.sort((a, b) => {
    const sortedByDate = compareAsc(a.date, b.date);
    if (sortedByDate !== 0) {
      return sortedByDate;
    }
    return a.resource.fullName.localeCompare(b.resource.fullName);
  });
};

export const isIntersectedAsDeniedInterval = (
  endOfInterval: Date | number,
  startOfDeniedRange: Date | number,
  intervalDuration: number
) => {
  return (
    (differenceInMinutes(endOfInterval, startOfDeniedRange) * 100) /
      intervalDuration >
    ALLOWABLE_INTERSECTION_PERCENTS
  );
};

export const isAllowAppointmentCell = (scheduleCell: ScheduleDayCell) =>
  scheduleCell.rangeType === ScheduleRangeType.AllowAppointment;

export const createMapForScheduleRanges = (
  ranges: ScheduleRange[],
  day: Date
) => {
  const entries = ranges.map<[Interval, ScheduleRange]>((item) => [
    {
      start: parseTime(item.time.start, day),
      end: subSeconds(parseTime(item.time.end, day), 1),
    },
    item,
  ]);
  return new Map(entries);
};

export const findInScheduleRanges = (
  date: Date | number,
  mapIntervalsToFind: Map<Interval, ScheduleRange>
) => {
  return Array.from(mapIntervalsToFind.keys()).find((interval) =>
    isWithinInterval(date, interval)
  );
};

const findRangesWithinInterval = (
  interval: Interval,
  mapIntervalsToFind: Map<Interval, ScheduleRange>
) => {
  return Array.from(mapIntervalsToFind.keys()).find(
    ({ start, end }) =>
      isWithinInterval(start, interval) && isWithinInterval(end, interval)
  );
};

const getAllowAppointmentRanges = (scheduleRanges: ScheduleRange[]) => {
  return scheduleRanges.filter(
    (item) => item.type === ScheduleRangeType.AllowAppointment
  );
};

const getDeniedAppointmentRanges = (scheduleRanges: ScheduleRange[]) => {
  return scheduleRanges.filter(
    (item) => item.type !== ScheduleRangeType.AllowAppointment
  );
};

const createScheduleCellForInterval = (
  interval: Interval,
  { id, type }: { id: number | null; type: ScheduleRangeType }
) => ({
  interval,
  rangeType: type,
  rangeId: id,
});

const createNoAppointmentCell = (interval: Interval) => {
  return createScheduleCellForInterval(interval, {
    id: null,
    type: ScheduleRangeType.NoAppointment,
  });
};

const createOutsideWorkingCell = (interval: Interval) =>
  createScheduleCellForInterval(interval, {
    id: null,
    type: ScheduleRangeType.OutsideWorking,
  });

const createEndDateFromStart = (date: Date | number) => {
  return subSeconds(date, 1);
};

const createStartDateFromEnd = (date: Date | number) => {
  return addSeconds(date, 1);
};

const mergeDeniedScheduleCells = (
  leftCell: ScheduleDayCell,
  rightCell: ScheduleDayCell
): ScheduleDayCell => {
  return {
    ...leftCell,
    interval: { start: leftCell.interval.start, end: rightCell.interval.end },
  };
};

const isSameDeniedScheduleCells = (
  leftCell: ScheduleDayCell,
  rightCell: ScheduleDayCell
) => {
  const {
    NoAppointment,
    NotWorking,
    Training,
    PaperWorking,
  } = ScheduleRangeType;
  if (isAllowAppointmentCell(leftCell) || isAllowAppointmentCell(rightCell)) {
    return false;
  }
  if (
    leftCell.rangeType === NoAppointment &&
    rightCell.rangeType === NoAppointment
  ) {
    return true;
  }
  const otherNotWorkingTypes = [NotWorking, Training, PaperWorking];
  return (
    otherNotWorkingTypes.includes(leftCell.rangeType) &&
    otherNotWorkingTypes.includes(rightCell.rangeType) &&
    leftCell.rangeType === rightCell.rangeType &&
    leftCell.rangeId === rightCell.rangeId
  );
};
