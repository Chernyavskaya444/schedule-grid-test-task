import React from 'react';
import { Patient } from '../../../types/patients';
import PatientSelect from './PatientSelect';
import ResourceSelectList from './ResourceSelectList';
import DateSelect from './DateSelect';
import { Resource } from '../../../types/resources';

interface SidebarProps {
  selectedPatient: Patient | undefined;
  selectedDate: Date | undefined;
  selectedResources: number[];
  onSelectedPatientChange: (patient: Patient | undefined) => void;
  onSelectedDateChange: (date: Date | undefined) => void;
  onSelectedResourcesChange: (resourceIds: number[]) => void;
  resources: Resource[];
  patients: Patient[];
  availableToAppointmentDates: Date[];
}

const Sidebar = (props: SidebarProps) => {
  const {
    selectedPatient,
    selectedDate,
    selectedResources,
    onSelectedPatientChange,
    onSelectedDateChange,
    onSelectedResourcesChange,
    availableToAppointmentDates,
    resources,
    patients,
  } = props;

  return (
    <div className="schedule-grid-sidebar">
      <div className="app-sidebar-block patient-select">
        <PatientSelect
          patients={patients}
          selectedPatient={selectedPatient}
          onPatientSelect={onSelectedPatientChange}
        />
      </div>

      <div className="app-sidebar-block schedule-date-select">
        <DateSelect
          value={selectedDate}
          onChange={onSelectedDateChange}
          disabled={selectedResources.length === 0}
          availableToAppointmentDates={availableToAppointmentDates}
        />
      </div>

      <div className="app-sidebar-block specialist-list">
        <ResourceSelectList
          resources={resources}
          selectedResources={selectedResources}
          onSelectedResourcesChange={onSelectedResourcesChange}
        />
      </div>
    </div>
  );
};

export default Sidebar;
