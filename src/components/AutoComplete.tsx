import React, { useRef, useState } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';

export interface AutoCompleteOption {
  key?: string;
  value: string | number;
  label: React.ReactNode;
}

export interface AutoCompleteProps {
  options: AutoCompleteOption[];
  onSelect: (value: string | number) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  minSearchQueryLength?: number;
  clearOnSelect?: boolean;
  showClearButton?: boolean;
}

const AutoComplete = (props: AutoCompleteProps) => {
  const {
    options,
    onSelect,
    onSearch,
    placeholder = 'Введите текст для поиска...',
    minSearchQueryLength = 4,
    clearOnSelect = true,
    showClearButton = false,
  } = props;

  const [inputValue, setInputValue] = useState('');
  const [isResultVisible, setResultVisibility] = useState(false);
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const handleDropdownClose = () => setResultVisibility(false);
  useOutsideClick(dropdownContentRef, handleDropdownClose);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    const shouldSearchProcess = searchValue.length >= minSearchQueryLength;

    setInputValue(searchValue);
    if (shouldSearchProcess) {
      onSearch(searchValue);
    }
    setResultVisibility(shouldSearchProcess);
  };

  const handleOptionClick = (value: string | number) => () => {
    onSelect(value);
    if (clearOnSelect) {
      setInputValue('');
    }
    setResultVisibility(false);
  };

  const handleInputClear = () => setInputValue('');

  return (
    <div className="auto-complete">
      <div className="auto-complete-dropdown form-group">
        <input
          className="auto-complete-input form-input form-input_with-btn"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
        />
        {showClearButton && !!inputValue.length && (
          <button className="form-clear-btn" onClick={handleInputClear} />
        )}
        <button className="form-search-btn form-input-btn" />

        {isResultVisible && (
          <div
            ref={dropdownContentRef}
            className="auto-complete-dropdown-content"
          >
            {options.length > 0 ? (
              options.map((item) => (
                <div
                  key={item.key || item.value}
                  className="auto-complete-dropdown-content-item"
                  onClick={handleOptionClick(item.value)}
                >
                  {item.label}
                </div>
              ))
            ) : (
              <div className="auto-complete-dropdown-content-item">
                Совпадений не найдено
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoComplete;
