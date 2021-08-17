import React, { createContext, ReactNode } from 'react';

import useToggleVideoOverlay from '../../hooks/useVideoOverlay/useToggleVideoOverlay';
import useToggleOverlayDrawing from '../../hooks/useVideoOverlay/useToggleOverlayDrawing';

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
}

export const OverlayContext = createContext<IOverlayContext>(null!);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [isOverlayEnabled, toggleVideoOverlay] = useToggleVideoOverlay();
  const [isOverlayDrawable, toggleOverlayDrawable] = useToggleOverlayDrawing();

  return (
    <OverlayContext.Provider
      value={{
        isOverlayEnabled,
        toggleVideoOverlay,
        isOverlayDrawable,
        toggleOverlayDrawable,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}
