import React, { useLayoutEffect, useState } from 'react';

function useWindowSize() {
  const [size, setSize] = useState({
    x: window.innerWidth * (window.visualViewport?.scale || 1),
    y: window.innerHeight * (window.visualViewport?.scale || 1),
  });
  useLayoutEffect(() => {
    function updateSize() {
      setSize({
        x: window.innerWidth * (window.visualViewport?.scale || 1),
        y: window.innerHeight * (window.visualViewport?.scale || 1),
      });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

export default useWindowSize;
