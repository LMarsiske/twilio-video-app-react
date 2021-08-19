import { useCallback, useState } from 'react';

export default function useToggleVideoOverlay() {
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(true);

  const toggleVideoOverlay = useCallback(() => {
    setIsOverlayEnabled(!isOverlayEnabled);
  }, [isOverlayEnabled]);

  const resetVideoOverlay = () => {
    setIsOverlayEnabled(false);
    setTimeout(() => setIsOverlayEnabled(true), 250);
  };

  return [isOverlayEnabled, toggleVideoOverlay, resetVideoOverlay] as const;
}
