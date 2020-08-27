import React, { useEffect, useRef } from 'react';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useTimeoutCallback from '../../../hooks/useTimeoutCallback';

interface NotificationSuccessProps {
  isShown: boolean;
  onClose: () => void;
}

const OPEN_STATE_TIME = 3000;

const NotificationSuccess = (props: NotificationSuccessProps) => {
  const { isShown, onClose } = props;
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const handleClose = () => isShown && onClose();
  useOutsideClick(notificationRef, handleClose);
  const { startTimeout } = useTimeoutCallback(handleClose, OPEN_STATE_TIME);

  useEffect(() => {
    if (isShown) {
      startTimeout();
    }
  }, [isShown, startTimeout]);

  return (
    <div className="notification-container">
      {isShown && (
        <div
          ref={notificationRef}
          className="notification success"
          onClick={handleClose}
        >
          <div className="notification-title">Запись создана</div>
          <div className="notification-body">
            <div className="notification-icon">
              <i className="fa fa-check-circle" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSuccess;
