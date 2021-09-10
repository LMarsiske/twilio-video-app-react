import React, { useState, useRef } from 'react';
import VideoOverlaySettingsDialog from '../../VideoOverlaySettingsDialog/VideoOverlaySettingsDialog';
import DeviceSelectionDialog from '../../DeviceSelectionDialog/DeviceSelectionDialog';
import ToggleScreenShareButton from '../../Buttons/ToogleScreenShareButton/ToggleScreenShareButton';
import { ExpandMore, MoreVert, Settings, SettingsOverscan, ScreenShare } from '@material-ui/icons';
import { Button, styled, Theme, useMediaQuery, Menu as MenuContainer, MenuItem, Typography } from '@material-ui/core';

import { useAppState } from '../../../state';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useIsRecording from '../../../hooks/useIsRecording/useIsRecording';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import useFlipCameraToggle from '../../../hooks/useFlipCameraToggle/useFlipCameraToggle';
import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';

export const IconContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '1.5em',
  marginRight: '0.3em',
});

export default function Menu(props: { buttonClassName?: string }) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [overlaySettingsOpen, setOverlaySettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { isFetching, updateRecordingRules, roomType } = useAppState();
  const { setIsChatWindowOpen } = useChatContext();
  const isRecording = useIsRecording();
  const { room, setIsBackgroundSelectionOpen, toggleScreenShare } = useVideoContext();
  const { isAdmin } = useAppState();
  const screenShareParticipant = useScreenShareParticipant();

  const anchorRef = useRef<HTMLButtonElement>(null);
  const { flipCameraDisabled, toggleFacingMode, flipCameraSupported } = useFlipCameraToggle();

  return (
    <>
      <Button
        onClick={() => setMenuOpen(isOpen => !isOpen)}
        ref={anchorRef}
        className={props.buttonClassName}
        data-cy-more-button
      >
        {isMobile ? (
          <MoreVert />
        ) : (
          <>
            More
            <ExpandMore />
          </>
        )}
      </Button>
      <MenuContainer
        open={menuOpen}
        onClose={() => setMenuOpen(isOpen => !isOpen)}
        anchorEl={anchorRef.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: isMobile ? -55 : 'bottom',
          horizontal: 'center',
        }}
        style={{ zIndex: 1299 }}
      >
        {/* {roomType !== 'peer-to-peer' && roomType !== 'go' && (
          <MenuItem
            disabled={isFetching}
            onClick={() => {
              setMenuOpen(false);
              if (isRecording) {
                updateRecordingRules(room!.sid, [{ type: 'exclude', all: true }]);
              } else {
                updateRecordingRules(room!.sid, [{ type: 'include', all: true }]);
              }
            }}
            data-cy-recording-button
          >
            <IconContainer>{isRecording ? <StopRecordingIcon /> : <StartRecordingIcon />}</IconContainer>
            <Typography variant="body1">{isRecording ? 'Stop' : 'Start'} Recording</Typography>
          </MenuItem>
        )} */}
        {/* {flipCameraSupported && (
          <MenuItem disabled={flipCameraDisabled} onClick={toggleFacingMode}>
            <IconContainer>
              <FlipCameraIcon />
            </IconContainer>
            <Typography variant="body1">Flip Camera</Typography>
          </MenuItem>
        )} */}

        <MenuItem
          onClick={() => {
            setMenuOpen(false);
            setSettingsOpen(true);
          }}
        >
          <IconContainer>
            <Settings />
          </IconContainer>
          <Typography variant="body1">Audio and Video Settings</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuOpen(false);
            toggleScreenShare();
          }}
          disabled={
            Boolean(screenShareParticipant) || !(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
          }
        >
          <IconContainer>
            <ScreenShare />
          </IconContainer>
          <Typography variant="body1">Share Screen</Typography>
        </MenuItem>

        {/* {isSupported && (
          <MenuItem
            onClick={() => {
              setIsBackgroundSelectionOpen(true);
              setIsChatWindowOpen(false);
              setMenuOpen(false);
            }}
          >
            <IconContainer>
              <BackgroundIcon />
            </IconContainer>
            <Typography variant="body1">Backgrounds</Typography>
          </MenuItem>
        )} */}

        {/* <MenuItem
          onClick={() => {
            setMenuOpen(false);
            setOverlaySettingsOpen(true);
          }}
        >
          <IconContainer>
            <SettingsOverscan />
          </IconContainer>
          <Typography variant="body1">Video Overlay Settings</Typography>
        </MenuItem> */}
      </MenuContainer>
      <VideoOverlaySettingsDialog
        open={overlaySettingsOpen}
        onClose={() => {
          setOverlaySettingsOpen(false);
        }}
      />
      <DeviceSelectionDialog
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
        }}
      />
    </>
  );
}
