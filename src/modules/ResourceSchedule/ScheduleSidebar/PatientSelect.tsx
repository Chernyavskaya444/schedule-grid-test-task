import React, { useState } from 'react';
import Dropdown from '../../../components/Dropdown';
import AutoComplete, {
  AutoCompleteOption,
} from '../../../components/AutoComplete';
import { Patient } from '../../../types/patients';
import userImg from '../../../assets/imgs/user.svg';
import powerImg from '../../../assets/imgs/power.svg';
import {
  DISPLAY_DATE_FORMAT,
  formatDate,
  parseDate,
} from '../../../utils/dateUtils';

interface PatientSelectProps {
  patients: Patient[];
  selectedPatient: Patient | undefined;
  onPatientSelect: (patient: Patient | undefined) => void;
}

const searchPatients = (searchQuery: string) => ({
  fullName,
  omsNumber,
}: Patient) =>
  fullName.toLocaleLowerCase().startsWith(searchQuery.toLocaleLowerCase()) ||
  omsNumber.startsWith(searchQuery);

const formatDateOfBirth = (date: Patient['dateOfBirth']) => {
  return formatDate(parseDate(date), DISPLAY_DATE_FORMAT);
};


const PatientSelect = (props: PatientSelectProps) => {
  const { patients, onPatientSelect, selectedPatient } = props;

  const [patientOptions, setPatientOptions] = useState<AutoCompleteOption[]>([]);

  const handlePatientSearch = (searchQuery: string) => {
    const searchResult = patients
      .filter(searchPatients(searchQuery))
      .map((item) => ({
        label: (
          <>
            <div>{item.fullName},</div>
            <div>Полис ОМС: {item.omsNumber}</div>
          </>
        ),
        value: item.id,
      }));

    setPatientOptions(searchResult);
  };

  const handlePatientSelect = (value: string | number) => {
    onPatientSelect(patients.find(({ id }) => id === value));
  };

  const handlePatientClear = (e: React.MouseEvent) => {
    e.preventDefault();
    onPatientSelect(undefined);
  };

  return (
    <div className="patient-select">
      <div className="flex justify-content-between align-items-end">
        <div className="block-title">
          <span className="title-text">Пациент</span>
        </div>
        <Dropdown
          dropdownContent={
            <div>
              <a href="/#" onClick={handlePatientClear}>
                <img src={powerImg} alt="" />
                Завершить работу с пациентом
              </a>
            </div>
          }
          disabled={!selectedPatient}
          placement="right"
          trigger="click"
          dropdownContentStyle={{ minWidth: '300px' }}
        >
          <button className="dropdown-btn" disabled={!selectedPatient}>
            <img src={userImg} alt="" />
          </button>
        </Dropdown>
      </div>
      <div className="patients-search">
        {selectedPatient ? (
          <div className="patient-info">
            <div>{selectedPatient.fullName}, </div>
            <div>
              {`${formatDateOfBirth(selectedPatient.dateOfBirth)} г.р.`}
            </div>
            <div>{`Полис ОМС: ${selectedPatient.omsNumber}`}</div>
          </div>
        ) : (
          <AutoComplete
            options={patientOptions}
            onSearch={handlePatientSearch}
            onSelect={handlePatientSelect}
            placeholder="Введите текст для поиска"
          />
        )}
      </div>
    </div>
  );
};

export default PatientSelect;
