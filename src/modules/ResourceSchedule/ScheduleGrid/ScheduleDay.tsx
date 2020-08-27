import React, { RefCallback, useRef, useState } from 'react';
import { getTime } from 'date-fns';
import {
  formatScheduleDayCaption,
  formatScheduleSummary,
} from './scheduleGridUtils';
import { ResourceScheduleDay } from '../../../types/schedules';
import ScheduleCell from './ScheduleCell';
import { AppointmentsWithRelations } from '../../../types/appointments';
import { ContextMenuHandlersProps } from './ScheduleCellContextMenu';
import {
  SetElementsCallback,
  HeaderElementSizes,
  HeaderElementNames,
} from './useCallbackOnElementsCollection';
import useScrollingElementCallback from '../../../hooks/useScrollingElementCallback';
import { getAppointmentsForScheduleCell } from '../../../utils/appointmentUtils';
import { areElementsOverlappingByHalf } from '../../../utils/scheduleUtils';

interface ScheduleDayProps {
  scheduleDayRecord: ResourceScheduleDay;
  appointments: AppointmentsWithRelations[];
  cellContextMenuProps: ContextMenuHandlersProps;
  setElementRefCallback: SetElementsCallback;
  headerElementSizes: HeaderElementSizes;
}

interface HeaderWorkingSummaryProps {
  summaryItems: string[];
  isCompactView: boolean;
  onOpen: () => void;
  refCallback: RefCallback<Element>;
}

const getStylesForHeaderElement = (
  headerElementSizes: HeaderElementSizes,
  elementName: HeaderElementNames
) => {
  return headerElementSizes[elementName]
    ? { height: `${headerElementSizes[elementName]}px` }
    : undefined;
};

const HeaderWorkingSummary = (props: HeaderWorkingSummaryProps) => {
  const { summaryItems, isCompactView, onOpen, refCallback } = props;
  return (
    <div
      ref={refCallback}
      className={`caption-schedule-summary ${
        isCompactView ? 'compact-view' : ''
      }`}
    >
      {!isCompactView ? (
        <>
          {summaryItems.map((summaryItem, index) => (
            <div key={index} className="summary-item">
              {summaryItem}
            </div>
          ))}
        </>
      ) : (
        <div onClick={onOpen} className="compact-view-inner">
          <div className="arrow-right" />
          Врач работает
        </div>
      )}
    </div>
  );
};

const ScheduleDay = (props: ScheduleDayProps) => {
  const {
    scheduleDayRecord,
    appointments,
    cellContextMenuProps,
    setElementRefCallback,
    headerElementSizes,
  } = props;

  const {
    date,
    scheduleCells,
    resource,
    scheduleRecord,
    scheduleDayKey,
  } = scheduleDayRecord;
  const formattedDate = formatScheduleDayCaption(date);
  const formattedScheduleSummary = formatScheduleSummary(date, scheduleRecord);

  const summaryElementRef = useRef<HTMLElement | null>(null);
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(null);
  const [isHeaderCompactView, setHeaderCompactView] = useState(false);
  const [isHeaderSummaryOpen, setHeaderSummaryOpen] = useState(false);

  const cellsContainerRef = useRef<HTMLDivElement | null>(null);

  const setContainerRefCallback: RefCallback<HTMLElement> = (element) => {
    setContainerElement(element);
  };

  const setHeaderElementRefCallback = (
    elementName: HeaderElementNames
  ): RefCallback<HTMLElement> => (element) => {
    if (elementName === 'summary') {
      summaryElementRef.current = element;
    }
    setElementRefCallback(scheduleDayKey, elementName, element);
  };

  useScrollingElementCallback(
    ({ prevPosition, currentPosition }) => {
      const scrollToUp = prevPosition.y > currentPosition.y;
      const shouldCheckToMakeCompact = scrollToUp && !isHeaderCompactView;
      const shouldCheckToMakeFullSize = !scrollToUp && isHeaderCompactView;
      isHeaderSummaryOpen && setHeaderSummaryOpen(false);

      if (shouldCheckToMakeCompact || shouldCheckToMakeFullSize) {
        const isCompact = areElementsOverlappingByHalf(
          summaryElementRef.current,
          cellsContainerRef.current
        );
        if (
          (shouldCheckToMakeCompact && isCompact) ||
          (shouldCheckToMakeFullSize && !isCompact)
        ) {
          setHeaderCompactView(isCompact);
        }
      }
    },
    containerElement,
    300
  );

  return (
    <div className="schedule-day" ref={setContainerRefCallback}>
      <div
        className="schedule-day-header"
        style={getStylesForHeaderElement(headerElementSizes, 'header')}
      >
        <div className="header-item caption-date capitalize">
          {formattedDate}
        </div>
        <div
          ref={setHeaderElementRefCallback('resource')}
          className="header-item caption-resource"
          style={
            isHeaderCompactView
              ? getStylesForHeaderElement(headerElementSizes, 'resource')
              : undefined
          }
        >
          {resource.fullName}
        </div>
        <div
          ref={setHeaderElementRefCallback('specialty')}
          className="header-item caption-resource specialty"
          style={
            isHeaderCompactView
              ? getStylesForHeaderElement(headerElementSizes, 'specialty')
              : undefined
          }
        >
          {resource.specialtyLabel}
        </div>
        <div
          ref={setHeaderElementRefCallback('facility')}
          className="header-item caption-facility"
          style={
            isHeaderCompactView
              ? getStylesForHeaderElement(headerElementSizes, 'facility')
              : undefined
          }
        >
          {resource.facility} ({resource.office})
        </div>
        <HeaderWorkingSummary
          refCallback={setHeaderElementRefCallback('summary')}
          summaryItems={formattedScheduleSummary}
          isCompactView={isHeaderCompactView && !isHeaderSummaryOpen}
          onOpen={() => setHeaderSummaryOpen(true)}
        />
      </div>
      <div ref={cellsContainerRef} className="schedule-day-cells">
        {scheduleCells.map((cell) => (
          <ScheduleCell
            key={getTime(cell.interval.start)}
            cellData={cell}
            appointments={getAppointmentsForScheduleCell(
              cell.interval,
              appointments
            )}
            resource={resource}
            cellContextMenuProps={cellContextMenuProps}
          />
        ))}
      </div>
    </div>
  );
};

export default ScheduleDay;
