import { useCallback, useState } from 'react';

export default function useToggleOverlayDrawing() {
  const [isOverlayDrawable, setIsOverlayDrawable] = useState(false);

  const toggleOverlayDrawable = useCallback(() => {
    setIsOverlayDrawable(!isOverlayDrawable);
  }, [isOverlayDrawable]);

  return [isOverlayDrawable, toggleOverlayDrawable] as const;
}
