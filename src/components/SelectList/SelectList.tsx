import React from 'react';
import SelectListItem, { TSelectListItem } from './SelectListItem';
import SelectListItemGroup, {
  TSelectListItemGroup,
} from './SelectListItemGroup';

interface SelectListProps {
  items: Array<TSelectListItem | TSelectListItemGroup>;
  selectedValues: Array<TSelectListItem['value']>;
  onSelectedChange: (values: Array<TSelectListItem['value']>) => void;
  scrollToItem?: TSelectListItem['value'];
}

const SelectList = (props: SelectListProps) => {
  const { items, selectedValues, onSelectedChange, scrollToItem } = props;

  const handleSelectedItemChange = (
    item: TSelectListItem,
    checked: boolean
  ) => {
    let checkedItems = selectedValues.filter((value) => item.value !== value);
    if (checked) {
      checkedItems = [...checkedItems, item.value];
    }
    onSelectedChange(checkedItems);
  };

  const handleSelectedItemGroupChange = (
    item: TSelectListItemGroup,
    checked: boolean
  ) => {
    const childrenValues = item.children.map((childItem) => childItem.value);
    let checkedItems = selectedValues.filter(
      (value) => !childrenValues.includes(value)
    );
    if (checked) {
      checkedItems = [...checkedItems, ...childrenValues];
    }
    onSelectedChange(checkedItems);
  };

  return (
    <div className="select-list-container">
      <ul className="select-list">
        {items.map((item) =>
          'children' in item ? (
            <SelectListItemGroup
              key={item.value}
              item={item}
              selectedValues={selectedValues}
              onItemChange={handleSelectedItemChange}
              onItemGroupChange={handleSelectedItemGroupChange}
              scrollToItem={scrollToItem}
            />
          ) : (
            <SelectListItem
              key={item.value}
              item={item}
              isChecked={selectedValues.includes(item.value)}
              onChange={handleSelectedItemChange}
              scrollToItem={scrollToItem}
            />
          )
        )}
      </ul>
    </div>
  );
};

export default SelectList;
