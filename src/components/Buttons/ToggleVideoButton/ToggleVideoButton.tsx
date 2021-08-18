import React, { useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import { Videocam, VideocamOff } from '@material-ui/icons';

import useDevices from '../../../hooks/useDevices/useDevices';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

export default function ToggleVideoButton(props: { disabled?: boolean; className?: string }) {
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const lastClickTimeRef = useRef(0);
  const { hasVideoInputDevices } = useDevices();

  const toggleVideo = useCallback(() => {
    if (Date.now() - lastClickTimeRef.current > 500) {
      lastClickTimeRef.current = Date.now();
      toggleVideoEnabled();
    }
  }, [toggleVideoEnabled]);

  return (
    <Button
      className={props.className}
      onClick={toggleVideo}
      disabled={!hasVideoInputDevices || props.disabled}
      startIcon={isVideoEnabled ? <Videocam /> : <VideocamOff />}
    >
      {!hasVideoInputDevices ? 'No Video' : isVideoEnabled ? 'Stop Video' : 'Start Video'}
    </Button>
  );
}
