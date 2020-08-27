import { RefObject, useEffect } from 'react';

const useOutsideClick = (
  ref: RefObject<HTMLElement | undefined>,
  callback: () => void
) => {
  const handleClick = (event: Event) => {
    if (!ref.current?.contains(event.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};

export default useOutsideClick;
