import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import Calendar from '../Calendar';
import useOutsideClick from '../../hooks/useOutsideClick';
import calendarImg from '../../assets/imgs/calendar.svg';
import calendarCancelImg from '../../assets/imgs/cross.svg';
import calendarOkImg from '../../assets/imgs/check-white.svg';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  isPastDatesDisabled?: boolean;
  isDateHighlighted?: (date: Date) => boolean;
}

const DatePicker = (props: DatePickerProps) => {
  const {
    value,
    onChange,
    placeholder,
    disabled = false,
    format: formatDate = 'MM/dd/yyyy',
    isPastDatesDisabled = false,
    isDateHighlighted,
  } = props;

  const formattedValue = value ? format(value, formatDate) : '';
  const [isOpen, setIsOpen] = useState(false);
  const [calendarValue, setCalendarValue] = useState<Date | undefined>(value);
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const handleCalendarClose = () => isOpen && setIsOpen(false);
  useOutsideClick(calendarContainerRef, handleCalendarClose);

  const handleCalendarOpen = () => {
    if (!disabled && !isOpen) {
      setCalendarValue(value);
      setIsOpen(true);
    }
  };

  const handleOkClick = () => {
    onChange(calendarValue);
    setIsOpen(false);
  };

  const handleCancelClick = () => handleCalendarClose();

  return (
    <div className="date-picker">
      <div className="date-picker-container form-group">
        <input
          className="date-picker-input form-input form-input_with-btn"
          placeholder={placeholder || formatDate}
          value={formattedValue}
          onClick={handleCalendarOpen}
          disabled={disabled}
          readOnly
        />
        <button
          onClick={handleCalendarOpen}
          disabled={disabled}
          className="form-input-btn form-datepicker-btn"
        >
          <img src={calendarImg} alt="" />
        </button>
        {isOpen && (
          <div
            ref={calendarContainerRef}
            className="date-picker-dropdown-content"
          >
            <Calendar
              selectedValue={calendarValue}
              onSelect={setCalendarValue}
              isPastDatesDisabled={isPastDatesDisabled}
              isDateHighlighted={isDateHighlighted}
            />
            <div className="date-picker-bottom flex justify-content-center">
              <button
                className="btn btn-white btn-cancel"
                onClick={handleCancelClick}
              >
                <img src={calendarCancelImg} alt="" />
                Отменить
              </button>
              <button className="btn btn-green btn-ok" onClick={handleOkClick}>
                <img src={calendarOkImg} alt="" />
                Ок
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
