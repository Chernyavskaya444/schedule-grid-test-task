import React from 'react';
import warningImg from '../../../assets/imgs/warning.svg';
import Modal from '../../../components/Modal';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const CancelAppointmentModal = (props: CancelAppointmentModalProps) => {
  const { onConfirm, onClose, ...modalProps } = props;

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Modal
      header={
        <>
          <img src={warningImg} alt="" />
          Отмена записи
        </>
      }
      className="cancel-appointment-modal"
      {...modalProps}
    >
      <>
        <div className="notification-text">
          Врач и пациент будут уведомлены <br />
          об отмене записи
        </div>
        <div className="modal-row">
          <button className="btn-cancel" onClick={onConfirm}>
            Отменить
          </button>
        </div>
        <div className="modal-row">
          <a href="/#" className="back-link" onClick={handleClose}>
            Вернуться к расписанию
          </a>
        </div>
      </>
    </Modal>
  );
};

export default CancelAppointmentModal;
