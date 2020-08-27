import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Sidebar from './ScheduleSidebar';
import Topbar from './Topbar';
import ScheduleGrid from './ScheduleGrid';
import { Patient } from '../../types/patients';
import { ScheduleRecord, SchedulePeriod } from '../../types/schedules';
import * as ScheduleService from '../../services/scheduleService';
import * as ResourceService from '../../services/resourceService';
import * as PatientService from '../../services/patientService';
import { getScheduleDays } from './ScheduleGrid/scheduleGridUtils';
import {
  getAvailableToAppointmentDates,
  getTwoWeeksScheduleRange,
} from '../../utils/scheduleUtils';

const ResourceSchedule = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient>();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<SchedulePeriod>(
    SchedulePeriod.Day
  );
  const [scheduleRecords, setScheduleRecords] = useState<ScheduleRecord[]>([]);

  const resources = ResourceService.getResources();
  const patients = PatientService.getPatients();

  useEffect(() => {
    if (selectedDate) {
      const dateRange = getTwoWeeksScheduleRange(selectedDate);
      const scheduleParams = { resourceIds: selectedResources, dateRange };
      const records = ScheduleService.getScheduleRecords(scheduleParams);
      setScheduleRecords(records);
    }
  }, [selectedDate, selectedResources]);

  const availableToAppointmentDates = useMemo<Date[]>(() => {
    if (selectedDate && scheduleRecords.length) {
      const dateRange = getTwoWeeksScheduleRange(selectedDate);
      const scheduleDays = getScheduleDays(scheduleRecords, dateRange);
      return getAvailableToAppointmentDates(scheduleDays);
    }
    return [];
  }, [scheduleRecords, selectedDate]);

  const handleResourcesSelect = (resourceIds: number[]) => {
    if (resourceIds.length && !selectedDate) {
      setSelectedDate(new Date());
    }
    if (!resourceIds.length) {
      setSelectedDate(undefined);
    }
    setSelectedResources(resourceIds);
  };

  return (
    <div className="resource-schedule-page">
      <Layout
        header={<div className="app-header" />}
        sidebar={
          <div className="app-sidebar">
            <Sidebar
              selectedPatient={selectedPatient}
              selectedDate={selectedDate}
              selectedResources={selectedResources}
              onSelectedPatientChange={setSelectedPatient}
              onSelectedDateChange={setSelectedDate}
              onSelectedResourcesChange={handleResourcesSelect}
              availableToAppointmentDates={availableToAppointmentDates}
              resources={resources}
              patients={patients}
            />
          </div>
        }
        content={
          <div className="app-content">
            <Topbar
              schedulePeriod={selectedPeriod}
              onSchedulePeriodChange={setSelectedPeriod}
            />
            <div className="page-content">
              <ScheduleGrid
                selectedDate={selectedDate}
                selectedResources={selectedResources}
                selectedPeriod={selectedPeriod}
                selectedPatient={selectedPatient}
                resources={resources}
                patients={patients}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ResourceSchedule;
