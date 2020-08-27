import React, { useLayoutEffect, useRef, useState } from 'react';
import { ScheduleDayCell } from '../../../types/schedules';
import { AppointmentsWithRelations } from '../../../types/appointments';
import { formatCellIntervalTime } from './scheduleGridUtils';
import useOutsideClick from '../../../hooks/useOutsideClick';
import { Resource } from '../../../types/resources';
import useDimensions from '../../../hooks/useDimensions';
import useWindowSize from '../../../hooks/useWindowSize';
import clockImg from '../../../assets/imgs/clock.svg';
import reportImg from '../../../assets/imgs/report.svg';
import pencilImg from '../../../assets/imgs/pencil.svg';
import trashImg from '../../../assets/imgs/trash.svg';
import avaPlaceholderImg from '../../../assets/imgs/ava-placeholder.svg';
import { getNameWithInitials } from '../../../utils/recordUtils';

export interface ScheduleCellContextMenuProps extends ContextMenuHandlersProps {
  cell: ScheduleDayCell;
  resource: Resource;
  appointments: AppointmentsWithRelations[];
  selectedAppointment: AppointmentsWithRelations | undefined;
  onClose: () => void;
}

export interface ContextMenuHandlersProps {
  isViewAppointmentActive: (
    appointment: AppointmentsWithRelations | undefined
  ) => boolean;
  isCreateAppointmentActive: (
    cellData: ScheduleDayCell,
    appointments: AppointmentsWithRelations[]
  ) => boolean;
  isCancelAppointmentActive: (
    cellData: ScheduleDayCell,
    appointment: AppointmentsWithRelations | undefined
  ) => boolean;
  onViewAppointment: (appointment: AppointmentsWithRelations) => void;
  onCreateAppointment: (cellData: ScheduleDayCell, resource: Resource) => void;
  onCancelAppointment: (appointment: AppointmentsWithRelations) => void;
}

interface PositionStyles {
  bottom?: number;
  right?: number;
}

const scheduleCellHeight = 32;

const ScheduleCellContextMenu = (props: ScheduleCellContextMenuProps) => {
  const {
    cell,
    appointments,
    selectedAppointment,
    resource,
    onClose,
    ...menuItemsHandlerProps
  } = props;
  const {
    isViewAppointmentActive,
    isCreateAppointmentActive,
    isCancelAppointmentActive,
    onViewAppointment,
    onCreateAppointment,
    onCancelAppointment,
  } = menuItemsHandlerProps;

  const [positionStyles, setPositionStyles] = useState<PositionStyles>({});
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(contextMenuRef, onClose);

  const dimensions = useDimensions(contextMenuRef);
  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    const positions: PositionStyles = {};
    if (windowSize && dimensions) {
      if (dimensions.bottom > windowSize.innerHeight) {
        positions.bottom = scheduleCellHeight;
      }
      if (dimensions.right > windowSize.innerWidth) {
        positions.right = 0;
      }
      setPositionStyles(positions);
    }
  }, [dimensions, windowSize]);

  const isViewItemActive = isViewAppointmentActive(selectedAppointment);
  const isCreateItemActive = isCreateAppointmentActive(cell, appointments);
  const isCancelItemActive = isCancelAppointmentActive(
    cell,
    selectedAppointment
  );

  const handleShowAppointment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isViewItemActive) {
      onViewAppointment(selectedAppointment!);
      onClose();
    }
  };

  const handleCreateAppointment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCreateItemActive) {
      onCreateAppointment(cell, resource);
      onClose();
    }
  };

  const handleCancelAppointment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCancelItemActive) {
      onCancelAppointment(selectedAppointment!);
      onClose();
    }
  };

  return (
    <div
      ref={contextMenuRef}
      className="context-menu-container"
      style={positionStyles}
    >
      <div className="header">
        {!!selectedAppointment ? (
          <div className="header-wrap">
            <div className="context-menu-header-ico">
              <img src={avaPlaceholderImg} alt="" />
            </div>
            <div className="header-text">
              {getNameWithInitials(selectedAppointment.patient.fullName)}
            </div>
          </div>
        ) : (
          <div className="header-wrap">
            <div className="context-menu-header-ico">
              <img src={clockImg} alt="" />
            </div>
            <div className="header-text">
              Выбран интервал времени <br />
              {formatCellIntervalTime(cell.interval)}
            </div>
          </div>
        )}
      </div>
      <div className="menu-content">
        <ul className="menu-items">
          <li className="item">
            <a
              href="/#"
              className={`grey ${isViewItemActive ? '' : 'disabled'}`}
              onClick={handleShowAppointment}
            >
              <img src={reportImg} alt="" />
              Просмотреть запись
            </a>
          </li>
          <li className="item">
            <a
              href="/#"
              className={`blue ${isCreateItemActive ? '' : 'disabled'}`}
              onClick={handleCreateAppointment}
            >
              <img src={pencilImg} alt="" />
              Создать запись
            </a>
          </li>
          <li className="item">
            <a
              href="/#"
              className={`red ${isCancelItemActive ? '' : 'disabled'}`}
              onClick={handleCancelAppointment}
            >
              <img src={trashImg} alt="" />
              Отменить запись
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ScheduleCellContextMenu;
