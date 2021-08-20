import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { Clear } from '@material-ui/icons';
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

export default function ResetOverlayButton(props: { disabled?: boolean }) {
  const classes = useStyles();
  const { resetVideoOverlay, isResetAllowed, toggleShouldClearOverlayState } = useOverlayContext();
  const isDisabled = !isResetAllowed;

  let tooltipMessage = '';

  if (!isResetAllowed) {
    tooltipMessage = 'The overlay cannot be cleared until it has been saved at least once.';
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
          onClick={() => toggleShouldClearOverlayState(true)}
          disabled={isDisabled}
          startIcon={<Clear />}
          data-cy-share-screen
        >
          Clear
        </Button>
      </span>
    </Tooltip>
  );
}
