import React, { createContext, ReactNode, useCallback, useState } from 'react';
import { CreateLocalTrackOptions, ConnectOptions, LocalAudioTrack, LocalVideoTrack, Room } from 'twilio-video';
import { ErrorCallback } from '../../types';
import { SelectedParticipantProvider } from './useSelectedParticipant/useSelectedParticipant';

import AttachVisibilityHandler from './AttachVisibilityHandler/AttachVisibilityHandler';
import useBackgroundSettings, { BackgroundSettings } from './useBackgroundSettings/useBackgroundSettings';
import useHandleRoomDisconnection from './useHandleRoomDisconnection/useHandleRoomDisconnection';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useLocalTracks from './useLocalTracks/useLocalTracks';
import useRestartAudioTrackOnDeviceChange from './useRestartAudioTrackOnDeviceChange/useRestartAudioTrackOnDeviceChange';
import useRoom from './useRoom/useRoom';
import useScreenShareToggle from './useScreenShareToggle/useScreenShareToggle';

import useToggleVideoOverlay from '../../hooks/useVideoOverlay/useToggleVideoOverlay';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IOverlayContext {
  // room: Room | null;
  // localTracks: (LocalAudioTrack | LocalVideoTrack)[];
  // isConnecting: boolean;
  // connect: (token: string) => Promise<void>;
  // onError: ErrorCallback;
  // getLocalVideoTrack: (newOptions?: CreateLocalTrackOptions) => Promise<LocalVideoTrack>;
  // getLocalAudioTrack: (deviceId?: string) => Promise<LocalAudioTrack>;
  // isAcquiringLocalTracks: boolean;
  // removeLocalVideoTrack: () => void;
  // isSharingScreen: boolean;
  // toggleScreenShare: () => void;
  // getAudioAndVideoTracks: () => Promise<void>;
  // isBackgroundSelectionOpen: boolean;
  // setIsBackgroundSelectionOpen: (value: boolean) => void;
  // backgroundSettings: BackgroundSettings;
  // setBackgroundSettings: (settings: BackgroundSettings) => void;
  isOverlayEnabled: boolean;
  toggleVideoOverlay: () => void;
}

export const OverlayContext = createContext<IOverlayContext>(null!);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [isOverlayEnabled, toggleVideoOverlay] = useToggleVideoOverlay();
  // const {
  //   localTracks,
  //   getLocalVideoTrack,
  //   getLocalAudioTrack,
  //   isAcquiringLocalTracks,
  //   removeLocalAudioTrack,
  //   removeLocalVideoTrack,
  //   getAudioAndVideoTracks,
  // } = useLocalTracks();

  // const [isBackgroundSelectionOpen, setIsBackgroundSelectionOpen] = useState(false);
  // const videoTrack = localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack | undefined;
  // const [backgroundSettings, setBackgroundSettings] = useBackgroundSettings(videoTrack, room);

  return (
    <OverlayContext.Provider
      value={{
        isOverlayEnabled,
        toggleVideoOverlay,
        // room,`
        // localTracks,
        // isConnecting,
        // onError: onErrorCallback,
        // getLocalVideoTrack,
        // getLocalAudioTrack,
        // connect,
        // isAcquiringLocalTracks,
        // removeLocalVideoTrack,
        // isSharingScreen,
        // toggleScreenShare,
        // getAudioAndVideoTracks,
        // isBackgroundSelectionOpen,
        // setIsBackgroundSelectionOpen,
        // backgroundSettings,
        // setBackgroundSettings,
      }}
    >
      {children}
      {/* <SelectedParticipantProvider room={room}>{children}</SelectedParticipantProvider>
        The AttachVisibilityHandler component is using the useLocalVideoToggle hook
        which must be used within the VideoContext Provider.

      <AttachVisibilityHandler /> */}
    </OverlayContext.Provider>
  );
}
