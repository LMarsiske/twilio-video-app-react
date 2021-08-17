import { useCallback, useState } from 'react';

export default function useToggleVideoOverlay() {
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(true);

  const toggleVideoOverlay = useCallback(() => {
    setIsOverlayEnabled(!isOverlayEnabled);
  }, [isOverlayEnabled]);

  return [isOverlayEnabled, toggleVideoOverlay] as const;
}
