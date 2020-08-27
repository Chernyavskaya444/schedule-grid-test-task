import React, { useCallback, useRef } from 'react';

export interface KeyedElements {
  [key: string]: HeaderElements;
}

export type SetElementsCallback = (
  key: string,
  elementName: HeaderElementNames,
  element: HTMLElement | null
) => void;

export type ElementsCollectionCallback = (elements: KeyedElements) => void;

export type HeaderElementNames =
  | 'header'
  | 'resource'
  | 'facility'
  | 'specialty'
  | 'summary';

export type HeaderElements = {
  [key in HeaderElementNames]?: HTMLElement | null;
};

export type HeaderElementSizes = { [key in HeaderElementNames]?: number };

const headerElementNames = [
  'header',
  'resource',
  'facility',
  'specialty',
  'summary',
];
const headerElementNamesWithoutHeader = [
  'resource',
  'facility',
  'specialty',
  'summary',
];

const headerDateHeight = 34;

export function calculateHeightForHeaderElements(
  elements: KeyedElements
): HeaderElementSizes {
  return headerElementNames.reduce<HeaderElementSizes>(
    (heights, elementName) => {
      if (elementName === 'header') {
        heights['header'] = getMaxHeightForFullHeader(elements);
      } else {
        heights[
          elementName as HeaderElementNames
        ] = getMaxHeightForNamedElement(
          elements,
          elementName as HeaderElementNames
        );
      }
      return heights;
    },
    {}
  );
}

function getMaxHeightForNamedElement(
  elements: KeyedElements,
  elementName: HeaderElementNames
) {
  return Math.max(
    ...Object.values(elements)
      .map((item) => item[elementName])
      .filter((item) => !!item)
      .map<number>((item) => item!.getBoundingClientRect().height)
  );
}

function getMaxHeightForFullHeader(elements: KeyedElements): number {
  return Math.max(
    ...Object.values(elements).map<number>((items: HeaderElements) =>
      calculateHeightForFullHeader(items)
    )
  );
}

function isEveryElementSet(elements: KeyedElements, keys: string[]) {
  const elementKeys = Object.keys(elements);
  const hasEveryElementKeys = keys.every((item) => elementKeys.includes(item));
  return (
    hasEveryElementKeys &&
    Object.values(elements).every(
      (itemElements) =>
        isEveryElementNamePresent(itemElements) &&
        isElementsNotNull(itemElements)
    )
  );
}

function isEveryElementNamePresent(elements: HeaderElements) {
  const elementNames = Object.keys(elements);
  return headerElementNamesWithoutHeader.every((item) =>
    elementNames.includes(item)
  );
}

function isElementsNotNull(headerElements: HeaderElements) {
  return Object.values(headerElements).every((item) => item !== null);
}

function calculateHeightForFullHeader(headerElements: HeaderElements) {
  return (
    headerElementNamesWithoutHeader.reduce<number>((sum, elementName) => {
      if (headerElements[elementName as HeaderElementNames]) {
        sum += headerElements[
          elementName as HeaderElementNames
        ]!.getBoundingClientRect().height;
      }
      return sum;
    }, 0) + headerDateHeight
  );
}


const useCallbackOnElementsCollection = (
  keys: string[],
  callback: ElementsCollectionCallback
): SetElementsCallback => {
  const headerElements = useRef<KeyedElements>({});
  const currentElementKeys = useRef<string[]>();

  const setElementsCallback = useCallback<SetElementsCallback>(
    (key, elementName, element) => {
      if (!headerElements.current[key]) {
        headerElements.current[key] = {};
      }

      if (!headerElements.current[key][elementName]) {
        headerElements.current[key][elementName] = element;
      }

      if (
        currentElementKeys.current !== keys &&
        isEveryElementSet(headerElements.current, keys)
      ) {
        callback(headerElements.current);
        currentElementKeys.current = keys;
      }
    },
    [keys, callback]
  );

  React.useEffect(() => {
    headerElements.current = {};
  }, [keys]);

  return setElementsCallback;
};

export default useCallbackOnElementsCollection;
