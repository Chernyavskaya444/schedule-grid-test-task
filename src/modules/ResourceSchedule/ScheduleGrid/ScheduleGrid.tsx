import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as ScheduleService from '../../../services/scheduleService';
import * as AppointmentService from '../../../services/appointmentService';
import { Patient } from '../../../types/patients';
import {
  ScheduleDayCell,
  ScheduleRecord,
  SchedulePeriod,
  DateInterval,
} from '../../../types/schedules';
import {
  getResourceScheduleDays,
  isAllowAppointmentCell,
} from './scheduleGridUtils';
import {
  getScheduleDateRange,
  isAllowableTimeDistance,
} from '../../../utils/scheduleUtils';
import {
  createAppointmentRecord,
  getAppointmentsByScheduleDay,
  mergeAppointmentRecords,
} from '../../../utils/appointmentUtils';
import ScheduleDay from './ScheduleDay';
import {
  Appointment,
  AppointmentsWithRelations,
} from '../../../types/appointments';
import { ContextMenuHandlersProps } from './ScheduleCellContextMenu';
import { Resource } from '../../../types/resources';
import ViewAppointmentModal from './ViewAppointmentModal';
import CancelAppointmentModal from './CancelAppointmentModal';
import NotificationSuccess from './NotificationSuccess';
import useCallbackOnElementsCollection, {
  ElementsCollectionCallback,
  HeaderElementSizes,
  calculateHeightForHeaderElements,
} from './useCallbackOnElementsCollection';
import {
  EMPTY_SCHEDULE_PARAMS,
  NO_SCHEDULE_DATA_FOUND,
} from '../../../constants/messages';

interface ScheduleGridProps {
  selectedDate: Date | undefined;
  selectedResources: number[];
  selectedPatient: Patient | undefined;
  selectedPeriod: SchedulePeriod;
  resources: Resource[];
  patients: Patient[];
}

const ScheduleGrid = (props: ScheduleGridProps) => {
  const {
    selectedDate,
    selectedResources,
    selectedPeriod,
    selectedPatient,
    resources,
    patients,
  } = props;

  const [scheduleRecords, setScheduleRecords] = useState<ScheduleRecord[]>([]);
  const [appointmentRecords, setAppointmentRecords] = useState<Appointment[]>(
    []
  );
  const [appointmentToView, setAppointmentToView] = useState<
    AppointmentsWithRelations
  >();
  const [appointmentToCancel, setAppointmentToCancel] = useState<
    AppointmentsWithRelations
  >();
  const [isShownNotificationSuccess, setShownNotificationSuccess] = useState(
    false
  );
  const [headerElementSizes, setHeaderElementSizes] = useState<
    HeaderElementSizes
  >({});

  const dateRange = useMemo<DateInterval | null>(() => {
    return selectedDate
      ? getScheduleDateRange(selectedDate, selectedPeriod)
      : null;
  }, [selectedDate, selectedPeriod]);

  useEffect(() => {
    if (dateRange) {
      const params = { resourceIds: selectedResources, dateRange };
      const foundScheduleRecords = ScheduleService.getScheduleRecords(params);
      setScheduleRecords(foundScheduleRecords);
    }
  }, [dateRange, selectedResources]);

  useEffect(() => {
    if (dateRange) {
      const params = { resourceIds: selectedResources, dateRange };
      const appointments = AppointmentService.getAppointmentRecords(params);
      setAppointmentRecords(mergeAppointmentRecords(appointments));
    }
  }, [dateRange, selectedResources]);

  const scheduleDayRecords = useMemo(() => {
    return dateRange
      ? getResourceScheduleDays(scheduleRecords, dateRange, resources)
      : [];
  }, [scheduleRecords, dateRange, resources]);

  const appointments = useMemo(() => {
    return getAppointmentsByScheduleDay(
      appointmentRecords,
      resources,
      patients
    );
  }, [appointmentRecords, resources, patients]);

  const scheduleDayKeys = useMemo(
    () => scheduleDayRecords.map((dayItem) => dayItem.scheduleDayKey),
    [scheduleDayRecords]
  );

  const callbackOnElementsCollectionSet = useCallback<
    ElementsCollectionCallback
  >((elements) => {
    if (Object.keys(elements).length > 0) {
      const elementHeights = calculateHeightForHeaderElements(elements);
      setHeaderElementSizes(elementHeights);
    }
  }, []);

  const setElementsRefCallback = useCallbackOnElementsCollection(
    scheduleDayKeys,
    callbackOnElementsCollectionSet
  );

  const handleViewAppointmentClose = () => setAppointmentToView(undefined);

  const handleCancelAppointmentClose = () => setAppointmentToCancel(undefined);

  const handleNotificationSuccessClose = () =>
    setShownNotificationSuccess(false);

  const isViewAppointmentActive = (
    appointment: AppointmentsWithRelations | undefined
  ) => !!appointment;

  const isCreateAppointmentActive = (
    cellData: ScheduleDayCell,
    appointments: AppointmentsWithRelations[]
  ) => {
    const hasPatientAppointment = appointments.some(
      ({ patientId }) => patientId === selectedPatient?.id
    );

    return (
      isAllowAppointmentCell(cellData) &&
      !!selectedPatient &&
      !hasPatientAppointment &&
      isAllowableTimeDistance(cellData.interval)
    );
  };

  const isCancelAppointmentActive = (
    cellData: ScheduleDayCell,
    appointment: AppointmentsWithRelations | undefined
  ) => {
    return !!appointment && isAllowableTimeDistance(cellData.interval);
  };

  const handleViewAppointment = (appointment: AppointmentsWithRelations) =>
    setAppointmentToView(appointment);

  const handleCreateAppointment = (
    cellData: ScheduleDayCell,
    resource: Resource
  ) => {
    if (!!selectedPatient) {
      const newAppointment = createAppointmentRecord(
        cellData.interval,
        resource,
        selectedPatient
      );
      setAppointmentRecords([...appointmentRecords, newAppointment]);
      setShownNotificationSuccess(true);
    }
  };

  const handleCancelAppointment = (appointment: AppointmentsWithRelations) =>
    setAppointmentToCancel(appointment);

  const handleCancelAppointmentConfirm = () => {
    if (appointmentToCancel) {
      setAppointmentRecords([
        ...appointmentRecords.filter(
          (item) => item.id !== appointmentToCancel.id
        ),
      ]);
    }
    handleCancelAppointmentClose();
  };

  const cellContextMenuProps: ContextMenuHandlersProps = {
    isViewAppointmentActive,
    isCreateAppointmentActive,
    isCancelAppointmentActive,
    onViewAppointment: handleViewAppointment,
    onCreateAppointment: handleCreateAppointment,
    onCancelAppointment: handleCancelAppointment,
  };

  const scheduleDataFound = scheduleDayRecords.length > 0;
  const isEmptyScheduleGridParams =
    dateRange === null || selectedResources.length === 0;

  return (
    <div className="schedule-grid">
      {scheduleDataFound &&
        scheduleDayRecords.map((recordDay) => (
          <ScheduleDay
            key={recordDay.scheduleDayKey}
            scheduleDayRecord={recordDay}
            appointments={appointments[recordDay.scheduleDayKey] || []}
            cellContextMenuProps={cellContextMenuProps}
            setElementRefCallback={setElementsRefCallback}
            headerElementSizes={headerElementSizes}
          />
        ))}
      {!scheduleDataFound && (
        <div className="empty-content">
          {isEmptyScheduleGridParams ? (
            <p className="message">{EMPTY_SCHEDULE_PARAMS}</p>
          ) : (
            <p className="message">{NO_SCHEDULE_DATA_FOUND}</p>
          )}
        </div>
      )}
      {!!appointmentToView && (
        <ViewAppointmentModal
          appointment={appointmentToView}
          isOpen={!!appointmentToView}
          onClose={handleViewAppointmentClose}
        />
      )}
      <CancelAppointmentModal
        isOpen={!!appointmentToCancel}
        onConfirm={handleCancelAppointmentConfirm}
        onClose={handleCancelAppointmentClose}
      />
      <NotificationSuccess
        isShown={isShownNotificationSuccess}
        onClose={handleNotificationSuccessClose}
      />
    </div>
  );
};

export default ScheduleGrid;
