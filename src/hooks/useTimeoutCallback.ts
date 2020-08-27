import { useEffect, useState, useCallback, useRef } from 'react';

const useTimeoutCallback = (
  callback: () => void,
  timeout: number = 0,
  runOnCalling: boolean = false
) => {
  const [isRunning, setIsRunning] = useState(runOnCalling);
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const startTimeout = () => setIsRunning(true);
  const stopTimeout = () => setIsRunning(false);

  const cancel = useCallback(() => {
    const timeoutId = timeoutIdRef.current;
    if (timeoutId) {
      timeoutIdRef.current = undefined;
      clearTimeout(timeoutId);
    }
  }, [timeoutIdRef]);

  useEffect(() => {
    if (isRunning) {
      timeoutIdRef.current = setTimeout(callback, timeout);
      return cancel;
    }
  }, [callback, timeout, isRunning, cancel]);

  return { startTimeout, stopTimeout };
};

export default useTimeoutCallback;
