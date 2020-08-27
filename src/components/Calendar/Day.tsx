import React from 'react';
import { getDate } from 'date-fns';
import { isPastDay } from '../../utils/dateUtils';

interface DayProps {
  date: Date;
  active: boolean;
  onClick: (date: Date) => void;
  isPastDatesDisabled?: boolean;
  isDateHighlighted?: (date: Date) => boolean;
}

const Day = (props: DayProps) => {
  const {
    date,
    onClick,
    active,
    isPastDatesDisabled = false,
    isDateHighlighted,
  } = props;

  const dayNumber = getDate(date);
  const isDisabled = isPastDatesDisabled && isPastDay(date);
  const isHighlighted = isDateHighlighted?.(date);
  const className = `${isDisabled && 'disabled'} ${
    isHighlighted && 'highlighted'
  }`;

  const handleClick = () => (isDisabled ? undefined : onClick(date));

  return (
    <li className={className}>
      <button
        onClick={handleClick}
        className={active ? 'active' : ''}
        type="button"
        disabled={isDisabled}
      >
        {active ? <span className="active">{dayNumber}</span> : dayNumber}
      </button>
    </li>
  );
};

export default Day;
