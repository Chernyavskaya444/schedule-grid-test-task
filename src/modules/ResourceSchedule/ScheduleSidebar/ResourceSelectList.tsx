import React, { useMemo, useState } from 'react';
import Dropdown from '../../../components/Dropdown';
import AutoComplete, {
  AutoCompleteOption,
} from '../../../components/AutoComplete';
import { Resource } from '../../../types/resources';
import ButtonGroup from '../../../components/ButtonGroup';
import SelectList from '../../../components/SelectList';
import { mapResourceToSelectItems } from '../../../utils/resourceUtils';
import filterImg from '../../../assets/imgs/filter.svg';
import checkImg from '../../../assets/imgs/check-black.svg';
import crossImg from '../../../assets/imgs/cross.svg';

interface ResourceSelectListProps {
  resources: Resource[];
  selectedResources: number[];
  onSelectedResourcesChange: (resourceIds: number[]) => void;
}

type ListDisplayMode = 'specialty' | 'alpha';

const LIST_DISPLAY_MODES = [
  { label: 'По специальностям', value: 'specialty' },
  { label: 'По алфавиту', value: 'alpha' },
];

const DEFAULT_DISPLAY_MODE = 'specialty';

const searchResources = (searchQuery: string) => ({
  fullName,
  specialtyLabel,
}: Resource) =>
  fullName.toLocaleLowerCase().startsWith(searchQuery.toLocaleLowerCase()) ||
  specialtyLabel
    .toLocaleLowerCase()
    .startsWith(searchQuery.toLocaleLowerCase());

const ResourceSelectList = (props: ResourceSelectListProps) => {
  const { resources, selectedResources, onSelectedResourcesChange } = props;
  const [resourceOptions, setResourceOptions] = useState<AutoCompleteOption[]>([]);
  const [listDisplayMode, setListDisplayMode] = useState<ListDisplayMode>(
    DEFAULT_DISPLAY_MODE
  );
  const [scrollToListItem, setScrollToListItem] = useState<string | number>();

  const selectListOptions = useMemo(() => {
    return mapResourceToSelectItems(resources, listDisplayMode);
  }, [resources, listDisplayMode]);

  const toggleListDisplayMode = (value: string | number) => {
    setListDisplayMode(value as ListDisplayMode);
  };

  const handleCheckAll = () => {
    const allIds = resources.map((item) => item.id);
    onSelectedResourcesChange(allIds);
  };

  const handleUncheckAll = () => {
    onSelectedResourcesChange([]);
  };

  const handleResourceSearch = (searchQuery: string) => {
    const searchResultOptions = resources
      .filter(searchResources(searchQuery))
      .map((item) => ({
        label: `${item.fullName} (${item.specialtyLabel})`,
        value: item.id,
      }));

    setResourceOptions(searchResultOptions);
  };

  const handleResourceSelect = (value: string | number) => {
    onSelectedResourcesChange([
      ...selectedResources.filter((item) => item !== value),
      value as number,
    ]);
    setScrollToListItem(value);
  };

  const handleSelectedResourcesChange = (list: (string | number)[]) => {
    onSelectedResourcesChange(list as number[]);
  };

  return (
    <div className="resource-select-list">
      <div className="flex justify-content-between align-items-center">
        <div className="block-title flex align-items-center">
          <span className="title-text">Специалисты</span>
          <span className="resource-counters">
            ({selectedResources.length}/{resources.length})
          </span>
        </div>
        <Dropdown
          dropdownContent={
            <div>
              <div className="dropdown-content-item" onClick={handleCheckAll}>
                <img src={checkImg} alt="" />
                Выбрать все
              </div>
              <div className="dropdown-content-item" onClick={handleUncheckAll}>
                <img src={crossImg} alt="" />
                Отменить все выбранные
              </div>
            </div>
          }
          placement="right"
          trigger="click"
          dropdownContentStyle={{ minWidth: '280px' }}
        >
          <button className="dropdown-btn">
            <img src={filterImg} alt="" />
          </button>
        </Dropdown>
      </div>
      <div className="resource-search" style={{ paddingTop: '10px' }}>
        <AutoComplete
          options={resourceOptions}
          onSearch={handleResourceSearch}
          onSelect={handleResourceSelect}
          placeholder="Введите текст для поиска"
          clearOnSelect={false}
          showClearButton
        />
      </div>

      <div className="resource-list-mode" style={{ paddingTop: '20px' }}>
        <ButtonGroup
          items={LIST_DISPLAY_MODES}
          value={listDisplayMode}
          onChange={toggleListDisplayMode}
          fullWidth
          buttonType="btn-white"
        />
      </div>

      <div className="resource-list">
        <SelectList
          items={selectListOptions}
          selectedValues={selectedResources}
          onSelectedChange={handleSelectedResourcesChange}
          scrollToItem={scrollToListItem}
        />
      </div>
    </div>
  );
};

export default ResourceSelectList;
