import { useEffect, useState } from 'react';

interface WindowSize {
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
}

const getWindowSize = () => {
  const { innerWidth, innerHeight, outerWidth, outerHeight } = window;
  return { innerWidth, innerHeight, outerWidth, outerHeight };
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize());

  useEffect(() => {
    function handleResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
