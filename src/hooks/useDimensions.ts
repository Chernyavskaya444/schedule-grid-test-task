import { RefObject, useLayoutEffect, useState } from 'react';

interface NodeDimensions {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

const useDimensions = (ref: RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState<NodeDimensions>();

  useLayoutEffect(() => {
    if (ref.current) {
      setDimensions(ref.current.getBoundingClientRect().toJSON());
    }
  }, [ref]);

  return dimensions;
};

export default useDimensions;
