import React, { useEffect, useRef } from 'react';

export interface TSelectListItem {
  value: string | number;
  label: string;
}

interface SelectListItemProps {
  item: TSelectListItem;
  isChecked: boolean;
  onChange: (item: TSelectListItem, checked: boolean) => void;
  scrollToItem?: TSelectListItem['value'];
}

const SelectListItem = ({
  item,
  isChecked,
  onChange,
  scrollToItem,
}: SelectListItemProps) => {
  const ref = useRef<HTMLLIElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(item, e.target.checked);

  useEffect(() => {
    if (scrollToItem && item.value === scrollToItem && ref.current) {
      ref.current!.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [scrollToItem, item]);

  return (
    <li ref={ref} className="select-list-item">
      <label className="item-label form-checkbox">
        <input type="checkbox" checked={isChecked} onChange={handleChange} />
        <div className="form-checkbox-ico" />
        <div className="form-checkbox-text">{item.label}</div>
      </label>
    </li>
  );
};

export default SelectListItem;
