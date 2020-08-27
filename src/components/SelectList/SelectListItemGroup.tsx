import React from 'react';
import SelectListItem, { TSelectListItem } from './SelectListItem';

export interface TSelectListItemGroup extends TSelectListItem {
  children: TSelectListItem[];
}

interface SelectListItemGroupProps {
  item: TSelectListItemGroup;
  selectedValues: Array<TSelectListItem['value']>;
  onItemGroupChange: (item: TSelectListItemGroup, checked: boolean) => void;
  onItemChange: (item: TSelectListItem, checked: boolean) => void;
  scrollToItem?: TSelectListItem['value'];
}

const SelectListItemGroup = (props: SelectListItemGroupProps) => {
  const {
    item,
    selectedValues,
    onItemGroupChange,
    onItemChange,
    scrollToItem,
  } = props;
  const isChecked = item.children.every((childItem) =>
    selectedValues.includes(childItem.value)
  );
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onItemGroupChange(item, e.target.checked);

  return (
    <li className="select-list-item-group">
      <span className="select-list-item">
        <label className="item-label form-checkbox">
          <input type="checkbox" checked={isChecked} onChange={handleChange} />
          <div className="form-checkbox-ico" />
          <div className="form-checkbox-text">{item.label}</div>
        </label>
      </span>
      <ul className="select-list">
        {item.children.map((childItem) => (
          <SelectListItem
            key={childItem.value}
            item={childItem}
            isChecked={selectedValues.includes(childItem.value)}
            onChange={onItemChange}
            scrollToItem={scrollToItem}
          />
        ))}
      </ul>
    </li>
  );
};

export default SelectListItemGroup;
