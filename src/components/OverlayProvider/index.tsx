import React, { createContext, ReactNode } from 'react';
import Konva from 'konva';

import useToggleVideoOverlay from '../../hooks/useVideoOverlay/useToggleVideoOverlay';
import useToggleOverlayDrawing from '../../hooks/useVideoOverlay/useToggleOverlayDrawing';
import useSaveOverlayImage from '../../hooks/useVideoOverlay/useSaveOverlayImage';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IOverlayContext {
  isOverlayEnabled: boolean;
  toggleVideoOverlay: () => void;
  isOverlayDrawable: boolean;
  toggleOverlayDrawable: () => void;
  overlayElements: { grid: Konva.Shape | null; lines: { tool: string; points: number[] }[] | null } | null;
  updateOverlayElements: (elements: { grid: Konva.Shape; lines: { tool: string; points: number[] }[] }) => void;
  isSavingAllowed: boolean;
  saveImage: () => void;
}

export const OverlayContext = createContext<IOverlayContext>(null!);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [isOverlayEnabled, toggleVideoOverlay] = useToggleVideoOverlay();
  const [isOverlayDrawable, toggleOverlayDrawable] = useToggleOverlayDrawing();
  const [overlayElements, updateOverlayElements, isSavingAllowed, saveImage] = useSaveOverlayImage();
  return (
    <OverlayContext.Provider
      value={{
        isOverlayEnabled,
        toggleVideoOverlay,
        isOverlayDrawable,
        toggleOverlayDrawable,
        overlayElements,
        updateOverlayElements,
        isSavingAllowed,
        saveImage,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}
