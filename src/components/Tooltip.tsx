import React, { useState } from 'react';
import useTimeoutCallback from '../hooks/useTimeoutCallback';

interface TooltipProps {
  content?: React.ReactNode;
  renderContent?: () => React.ReactNode;
  children: React.ReactNode;
  trigger?: 'click' | 'hover';
  delay?: number;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const Tooltip = (props: TooltipProps) => {
  const {
    children,
    content,
    renderContent,
    style,
    trigger = 'hover',
    delay = 0,
    disabled = false,
  } = props;

  const [active, setActive] = useState(false);
  const openTooltip = () => setActive(true);
  const { startTimeout, stopTimeout } = useTimeoutCallback(openTooltip, delay);

  const handleMouseEnter =
    trigger === 'hover' && !disabled ? () => startTimeout() : undefined;

  const handleMouseLeave =
    trigger === 'hover' && !disabled
      ? () => {
          stopTimeout();
          setActive(false);
        }
      : undefined;

  const handleMouseClick =
    trigger === 'click' && !disabled ? () => setActive(!active) : undefined;

  return !disabled ? (
    <div className="tooltip">
      {active && (
        <span className="tooltip-content active" style={style}>
          {renderContent ? renderContent() : content}
        </span>
      )}
      <div
        className="tooltip-children"
        onMouseEnter={handleMouseEnter}
        onMouseOut={handleMouseLeave}
        onClick={handleMouseClick}
      >
        {children}
      </div>
    </div>
  ) : (
    <>{children}</>
  );
};

export default Tooltip;
