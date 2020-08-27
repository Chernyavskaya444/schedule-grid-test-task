import React, { useRef, useState } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';

interface DropdownProps {
  dropdownContent: React.ReactNode;
  children: React.ReactNode;
  placement?: 'left' | 'right';
  trigger?: 'hover' | 'click';
  disabled?: boolean;
  dropdownContentStyle?: React.CSSProperties;
}

const Dropdown = (props: DropdownProps) => {
  const {
    children,
    dropdownContent,
    placement = 'left',
    trigger = 'click',
    disabled = false,
  } = props;

  const [buttonToggle, setButtonToggle] = useState(false);
  const showOnClick = trigger === 'click';
  const activeActionClass = showOnClick
    ? 'dropdown-clickable'
    : 'dropdown-hoverable';
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const handleDropdownClose = () => buttonToggle && setButtonToggle(false);
  useOutsideClick(dropdownContentRef, handleDropdownClose);

  const handleClick =
    !showOnClick || disabled ? undefined : () => setButtonToggle(!buttonToggle);

  return (
    <div
      className={`dropdown ${activeActionClass} ${
        buttonToggle ? 'dropdown-open' : ''
      } ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      {children}
      <div
        ref={dropdownContentRef}
        className={`dropdown-content ${
          placement === 'right' ? 'dropdown-content-right' : ''
        }`}
        style={props.dropdownContentStyle}
      >
        {dropdownContent}
      </div>
    </div>
  );
};

export default Dropdown;
