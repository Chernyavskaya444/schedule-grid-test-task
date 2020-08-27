import React from 'react';

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  header?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const Modal = (props: ModalProps) => {
  const {
    isOpen,
    onClose,
    children,
    header,
    className,
    showCloseButton = false,
  } = props;

  const handleClose = () => onClose?.();

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`modal ${className} ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        {showCloseButton && (
          <span className="close" onClick={handleClose}>
            &times;
          </span>
        )}
        {!!header && <div className="header-text">{header}</div>}
        <div className="modal-content-children">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
