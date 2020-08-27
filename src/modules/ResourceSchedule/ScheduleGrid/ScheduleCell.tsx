import React, { useState } from 'react';
import {
  ScheduleDayCell,
  ScheduleRangeType,
  ScheduleRangeTypeLabel,
} from '../../../types/schedules';
import { formatTime } from '../../../utils/dateUtils';
import Tooltip from '../../../components/Tooltip';
import { AppointmentsWithRelations } from '../../../types/appointments';
import ScheduleCellContextMenu, {
  ContextMenuHandlersProps,
} from './ScheduleCellContextMenu';
import { Resource } from '../../../types/resources';
import { isAllowableTimeDistance } from '../../../utils/scheduleUtils';
import { getNameWithInitials } from '../../../utils/recordUtils';

interface ScheduleCellProps {
  cellData: ScheduleDayCell;
  appointments: AppointmentsWithRelations[];
  resource: Resource;
  cellContextMenuProps: ContextMenuHandlersProps;
}

interface DeniedIntervalAppointmentProps {
  appointments: AppointmentsWithRelations[];
  onClick: (appointment: AppointmentsWithRelations) => void;
}

interface AllowedIntervalProps {
  timeLabel: string;
  onClick: () => void;
}

interface AllowedWithAppointmentsProps {
  timeLabel: string;
  appointments: AppointmentsWithRelations[];
  onClick: (appointment: AppointmentsWithRelations) => void;
}

const tooltipStyles = { width: '250px' };
const tooltipDelay = 1000;

const AllowedInterval = ({ timeLabel, onClick }: AllowedIntervalProps) => {
  const handleClick = () => onClick();
  return (
    <div className="allowed-interval" onClick={handleClick}>
      <div className="inner">{timeLabel}</div>
    </div>
  );
};

const AllowedWithAppointments = (props: AllowedWithAppointmentsProps) => {
  const { timeLabel, appointments, onClick } = props;
  const hasTwoAppointments = appointments.length === 2;

  return (
    <div
      className="allowed-interval"
      onClick={!hasTwoAppointments ? () => onClick(appointments[0]) : undefined}
    >
      <div className="appointments">
        <div className="time-label">{timeLabel}</div>
        <div className="patients">
          {appointments.map((item) => (
            <div
              key={item.patient.id}
              className={`item ${hasTwoAppointments ? 'w-50' : ''}`}
              onClick={hasTwoAppointments ? () => onClick(item) : undefined}
            >
              <Tooltip content={item.patient.fullName} style={tooltipStyles}>
                <div className="name">
                  {getNameWithInitials(item.patient.fullName)}
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DeniedInterval = ({ rangeType }: { rangeType: ScheduleRangeType }) => (
  <div className="denied-interval">{ScheduleRangeTypeLabel[rangeType]}</div>
);

const DeniedIntervalAppointment = (props: DeniedIntervalAppointmentProps) => {
  const { appointments, onClick } = props;
  const [appointment] = appointments;

  return (
    <div
      className="denied-interval-appointment"
      onClick={() => onClick(appointment)}
    >
      <div className="time-label">{appointment.time}</div>
      <div className="patient">
        {getNameWithInitials(appointment.patient.fullName)}
      </div>
    </div>
  );
};


const ScheduleCell = (props: ScheduleCellProps) => {
  const { cellData, appointments, resource, cellContextMenuProps } = props;
  const { interval, rangeType } = cellData;
  const startTime = formatTime(interval.start);
  const isAllowAppointmentInterval =
    rangeType === ScheduleRangeType.AllowAppointment;
  const hasAppointments = appointments.length > 0;

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [appointmentForContextMenu, setAppointmentForContextMenu] = useState<
    AppointmentsWithRelations
  >();

  const handleContextMenuOpen = (
    selectedAppointment?: AppointmentsWithRelations
  ) => {
    if (!showContextMenu) {
      setAppointmentForContextMenu(selectedAppointment);
      setShowContextMenu(true);
    }
  };

  const handleContextMenuClose = () => {
    if (showContextMenu) {
      setShowContextMenu(false);
      setAppointmentForContextMenu(undefined);
    }
  };

  const renderTooltipContent = () => {
    const appointmentAllowed = isAllowableTimeDistance(interval);

    return appointmentAllowed
      ? 'Время доступно для записи'
      : 'Запись на прошедший временной интервал недоступна';
  };

  const contextMenu = (
    <ScheduleCellContextMenu
      cell={cellData}
      appointments={appointments}
      resource={resource}
      selectedAppointment={appointmentForContextMenu}
      onClose={handleContextMenuClose}
      {...cellContextMenuProps}
    />
  );

  return isAllowAppointmentInterval ? (
    <div className="schedule-cell">
      {!hasAppointments ? (
        <Tooltip
          renderContent={renderTooltipContent}
          delay={tooltipDelay}
          style={tooltipStyles}
        >
          <AllowedInterval
            timeLabel={startTime}
            onClick={handleContextMenuOpen}
          />
        </Tooltip>
      ) : (
        <AllowedWithAppointments
          timeLabel={startTime}
          appointments={appointments}
          onClick={handleContextMenuOpen}
        />
      )}
      {showContextMenu && contextMenu}
    </div>
  ) : (
    <div className="schedule-cell">
      <DeniedInterval rangeType={rangeType} />
      {hasAppointments && (
        <div className="denied-interval-menu-container">
          <DeniedIntervalAppointment
            appointments={appointments}
            onClick={handleContextMenuOpen}
          />
          {showContextMenu && contextMenu}
        </div>
      )}
      {hasAppointments && <DeniedInterval rangeType={rangeType} />}
    </div>
  );
};

export default ScheduleCell;
