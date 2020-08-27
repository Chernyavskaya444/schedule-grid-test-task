import React, { useState } from 'react';
import { addMonths, startOfMonth, subMonths, isSameDay } from 'date-fns';
import Day from './Day';
import { getDaysForMonth } from './calendarUtils';
import { formatDate } from '../../utils/dateUtils';

interface CalendarProps {
  selectedValue: Date | undefined;
  onSelect: (date: Date) => void;
  isPastDatesDisabled?: boolean;
  isDateHighlighted?: (date: Date) => boolean;
}

const MONTH_YEAR_LABEL_FORMAT = 'LLLL yyyy';

const Calendar = (props: CalendarProps) => {
  const {
    selectedValue,
    onSelect,
    isPastDatesDisabled,
    isDateHighlighted,
  } = props;

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(selectedValue || new Date())
  );

  const days = getDaysForMonth(currentMonth);
  const monthLabel = formatDate(currentMonth, MONTH_YEAR_LABEL_FORMAT);

  const handleNextClick = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevClick = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    onSelect(day);
    setCurrentMonth(startOfMonth(day));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-month">
        <div className="prev" onClick={handlePrevClick}>
          &#10094;
        </div>
        <div className="calendar-month-text">{monthLabel}</div>
        <div className="next" onClick={handleNextClick}>
          &#10095;
        </div>
      </div>

      <ul className="calendar-weekdays">
        <li>Пн</li>
        <li>Вт</li>
        <li>Ср</li>
        <li>Чт</li>
        <li>Пт</li>
        <li>Сб</li>
        <li>Вс</li>
      </ul>

      <ul className="calendar-days">
        {days.map((day) => (
          <Day
            key={day.getTime()}
            date={day}
            active={!!selectedValue && isSameDay(day, selectedValue)}
            onClick={handleDayClick}
            isPastDatesDisabled={isPastDatesDisabled}
            isDateHighlighted={isDateHighlighted}
          />
        ))}
      </ul>
    </div>
  );
};

export default Calendar;
