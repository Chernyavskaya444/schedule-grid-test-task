import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';

export const getDaysForMonth = (currentMonth: Date) => {
  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const startWeek = startOfWeek(startMonth, { weekStartsOn: 1 });
  const endWeek = endOfWeek(endMonth, { weekStartsOn: 1 });

  return eachDayOfInterval({
    start: startWeek,
    end: endWeek,
  });
};
