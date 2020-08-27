import React from 'react';
import ButtonGroup from '../../components/ButtonGroup';
import { SchedulePeriod } from '../../types/schedules';

const SCHEDULE_PERIOD_OPTIONS = [
  { label: '1 день', value: SchedulePeriod.Day },
  { label: '2 дня', value: SchedulePeriod.TwoDays },
  { label: 'Неделя', value: SchedulePeriod.Week },
];

interface TopbarProps {
  schedulePeriod: SchedulePeriod;
  onSchedulePeriodChange: (value: SchedulePeriod) => void;
}

const Topbar = (props: TopbarProps) => {
  const { schedulePeriod, onSchedulePeriodChange } = props;

  const toggleSchedulePeriod = (value: string | number) =>
    onSchedulePeriodChange(value as SchedulePeriod);

  return (
    <div className="schedule-content-topbar">
      <div className="flex justify-content-between align-items-center">
        <div className="page-title">Расписание специалистов</div>

        <div className="schedule-period-buttons">
          <ButtonGroup
            items={SCHEDULE_PERIOD_OPTIONS}
            value={schedulePeriod}
            onChange={toggleSchedulePeriod}
            buttonType="btn-green"
          />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
