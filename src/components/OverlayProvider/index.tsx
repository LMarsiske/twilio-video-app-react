import React, { createContext, ReactNode } from 'react';
import Konva from 'konva';

import useToggleVideoOverlay from '../../hooks/useVideoOverlay/useToggleVideoOverlay';
import useToggleOverlayDrawing from '../../hooks/useVideoOverlay/useToggleOverlayDrawing';
import useOverlayImageState from '../../hooks/useVideoOverlay/useOverlayImageState';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IOverlayContext {
  isOverlayEnabled: boolean;
  toggleVideoOverlay: () => void;
  resetVideoOverlay: () => void;
  isOverlayDrawable: boolean;
  toggleOverlayDrawable: () => void;
  overlayElements: { grid: Konva.Shape | null; lines: { tool: string; points: number[] }[] | null } | null;
  updateOverlayElements: (elements: { grid: Konva.Shape; lines: { tool: string; points: number[] }[] }) => void;
  isSavingAllowed: boolean;
  saveImage: () => void;
  isResetAllowed: boolean;
  shouldClearVideoOverlay: boolean;
  toggleShouldClearOverlayState: (state: boolean) => void;
}

export const OverlayContext = createContext<IOverlayContext>(null!);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [isOverlayEnabled, toggleVideoOverlay, resetVideoOverlay] = useToggleVideoOverlay();
  const [isOverlayDrawable, toggleOverlayDrawable, setIsOverlayDrawable] = useToggleOverlayDrawing();
  const [
    overlayElements,
    updateOverlayElements,
    isSavingAllowed,
    saveImage,
    isResetAllowed,
    setIsResetAllowed,
    shouldClearVideoOverlay,
    toggleShouldClearOverlayState,
  ] = useOverlayImageState();
  return (
    <OverlayContext.Provider
      value={{
        isOverlayEnabled,
        toggleVideoOverlay,
        resetVideoOverlay: () => {
          resetVideoOverlay();
          setIsOverlayDrawable(false);
          setIsResetAllowed(false);
        },
        isOverlayDrawable,
        toggleOverlayDrawable,
        overlayElements,
        updateOverlayElements,
        isSavingAllowed,
        saveImage,
        isResetAllowed,
        shouldClearVideoOverlay,
        toggleShouldClearOverlayState,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}
