import { useCallback, useLayoutEffect, useRef } from 'react';

export type EffectOnScrollCallback = ({
  prevPosition,
  currentPosition,
}: {
  prevPosition: ScrollPosition;
  currentPosition: ScrollPosition;
}) => void;

interface ScrollPosition {
  x: number;
  y: number;
}

function getScrollPosition(
  useWindow: boolean = false,
  element?: Element | null
): ScrollPosition {
  const target = !!element ? element : document.body;
  const position = target.getBoundingClientRect();

  return useWindow
    ? { x: window.scrollX, y: window.scrollY }
    : { x: position.left, y: position.top };
}

const useScrollingElementCallback = (
  effectCallback: EffectOnScrollCallback,
  element: Element | null = null,
  wait: number = 0,
  useWindow: boolean = false
) => {
  const position = useRef(getScrollPosition(useWindow, element));

  const throttleTimeout = useRef<NodeJS.Timeout>();

  const callBack = useCallback(() => {
    const currentPosition = getScrollPosition(useWindow, element);
    effectCallback({ prevPosition: position.current, currentPosition });
    position.current = currentPosition;
    throttleTimeout.current = undefined;
  }, [effectCallback, useWindow, element]);

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (wait) {
        if (throttleTimeout.current === undefined) {
          throttleTimeout.current = setTimeout(callBack, wait);
        }
      } else {
        callBack();
      }
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      throttleTimeout.current && clearTimeout(throttleTimeout.current!);
    };
  }, [element, callBack, wait]);
};

export default useScrollingElementCallback;
