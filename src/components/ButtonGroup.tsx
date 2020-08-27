import React from 'react';

interface ButtonGroupProps {
  items: ButtonGroupItem[];
  value: string | number;
  onChange: (value: string | number) => void;
  fullWidth?: boolean;
  buttonType: string;
}

interface ButtonGroupItem {
  label: string;
  value: string | number;
}

const ButtonGroup = (props: ButtonGroupProps) => {
  const { items, value, onChange, fullWidth = false, buttonType } = props;
  const itemStyle = fullWidth ? { width: `${100 / items.length}%` } : {};

  const handleChange = (value: string | number) => () => onChange(value);

  return (
    <div className={`btn-group ${fullWidth ? 'w-100' : ''}`}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={handleChange(item.value)}
          className={`btn ${buttonType} ${value === item.value && 'active'}`}
          style={itemStyle}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
