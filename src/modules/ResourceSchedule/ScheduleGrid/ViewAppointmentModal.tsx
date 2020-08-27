import React from 'react';
import { AppointmentsWithRelations } from '../../../types/appointments';
import { DISPLAY_DATE_FORMAT, formatDate } from '../../../utils/dateUtils';
import { getNameWithInitials } from '../../../utils/recordUtils';
import reportImg from '../../../assets/imgs/report.svg';
import Modal from '../../../components/Modal';

interface ViewAppointmentModalProps {
  appointment: AppointmentsWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

const ViewAppointmentModal = (props: ViewAppointmentModalProps) => {
  const { appointment, ...modalProps } = props;
  const { patient, resource, datetime } = appointment;

  return (
    <Modal
      header={
        <>
          <img src={reportImg} alt="" />
          {getNameWithInitials(patient.fullName)}
        </>
      }
      className="view-appointment-modal"
      showCloseButton
      {...modalProps}
    >
      <div className="flex flex-column">
        <div className="text-line">
          <div className="text-label">Дата:</div>
          <div className="text-item">
            {formatDate(datetime, DISPLAY_DATE_FORMAT)}
          </div>
        </div>
        <div className="text-line">
          <div className="text-label">Врач:</div>
          <div className="text-item">{resource.fullName}</div>
        </div>
        <div className="text-line">
          <div className="text-label">Кабинет:</div>
          <div className="text-item">{resource.office}</div>
        </div>
        <div className="text-line">
          <div className="text-label">Полис ОМС:</div>
          <div className="text-item">{patient.omsNumber}</div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewAppointmentModal;
