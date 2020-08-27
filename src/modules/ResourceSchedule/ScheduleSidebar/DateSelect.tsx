import React from 'react';
import { isSameDay } from 'date-fns';
import DatePicker from '../../../components/DatePicker';
import { DISPLAY_DATE_FORMAT } from '../../../utils/dateUtils';
import Tooltip from '../../../components/Tooltip';

interface DateSelectProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  availableToAppointmentDates?: Date[];
  disabled?: boolean;
}

const DateSelect = (props: DateSelectProps) => {
  const highlightedDate = (date: Date) => {
    const { availableToAppointmentDates } = props;
    if (availableToAppointmentDates?.length) {
      return availableToAppointmentDates.some((dateItem) =>
        isSameDay(dateItem, date)
      );
    }
    return false;
  };

  return (
    <div className="date-select">
      <div className="block-title">
        <span className="title-text">Дата записи</span>
      </div>
      <div className="schedule-date">
        <Tooltip content="Выберите доступный ресурс" disabled={!props.disabled}>
          <DatePicker
            value={props.value}
            onChange={props.onChange}
            format={DISPLAY_DATE_FORMAT}
            placeholder="ДД.ММ.ГГГГ"
            disabled={props.disabled}
            isPastDatesDisabled
            isDateHighlighted={highlightedDate}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default DateSelect;
