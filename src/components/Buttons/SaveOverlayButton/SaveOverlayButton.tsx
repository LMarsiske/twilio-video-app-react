import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { Save } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';

import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

import useOverlayContext from '../../../hooks/useOverlayContext/useOverlayContext';

export const SCREEN_SHARE_TEXT = 'Share Screen';
export const STOP_SCREEN_SHARE_TEXT = 'Stop Sharing Screen';
export const SHARE_IN_PROGRESS_TEXT = 'Cannot share screen when another user is sharing';
export const SHARE_NOT_SUPPORTED_TEXT = 'Screen sharing is not supported with this browser';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      '&[disabled]': {
        color: '#bbb',
        '& svg *': {
          fill: '#bbb',
        },
      },
    },
  })
);

export default function SaveOverlayButton(props: { disabled?: boolean }) {
  const classes = useStyles();
  const { saveImage, isSavingAllowed } = useOverlayContext();
  const screenShareParticipant = useScreenShareParticipant();
  const disableScreenShareButton = Boolean(screenShareParticipant);
  const isScreenShareSupported = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  const isDisabled = !isSavingAllowed;

  let tooltipMessage = '';

  if (!isSavingAllowed) {
    tooltipMessage = 'The overlay cannot be saved until at least one mark has been drawn on it.';
  }

  return (
    <Tooltip
      title={tooltipMessage}
      placement="top"
      PopperProps={{ disablePortal: true }}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <span>
        {/* The span element is needed because a disabled button will not emit hover events and we want to display
          a tooltip when screen sharing is disabled */}
        <Button
          className={classes.button}
          onClick={saveImage}
          disabled={isDisabled}
          startIcon={<Save />}
          data-cy-share-screen
        >
          Save
        </Button>
      </span>
    </Tooltip>
  );
}
