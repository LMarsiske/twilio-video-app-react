import React, { useRef, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Button, Tooltip, Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@material-ui/core';
import { Clear, Undo, Replay } from '@material-ui/icons';

import CustomHoverMenu from '../../CustomHoverMenu/CustomHoverMenu';

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

export default function ClearUndoOverlayButton(props: { disabled?: boolean }) {
  const classes = useStyles();
  const {
    isResetAllowed,
    canUndoLastLine,
    toggleShouldClearOverlayState,
    toggleShouldUndoLastLine,
    resetOverlay,
  } = useOverlayContext();

  const isDisabled = false;
  let tooltipMessage = '';
  if (!isResetAllowed) {
    tooltipMessage = 'The overlay cannot be cleared until it has been saved at least once.';
  }

  return (
    <>
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
            onClick={() => toggleShouldUndoLastLine(true)}
            disabled={!canUndoLastLine}
            startIcon={<Undo />}
            data-cy-share-screen
            style={{ paddingRight: 0 }}
          >
            Undo
          </Button>
        </span>
      </Tooltip>
      <CustomHoverMenu
        // children={markers.map((marker, index) => (
        //   <MenuItem key={index}>
        //     <FormControlLabel
        //       control={<Checkbox checked={marker.active} onChange={handleChange} name={marker.id} />}
        //       label={marker.id.toUpperCase()}
        //     />
        //   </MenuItem>
        // ))}
        children={
          <>
            <MenuItem onClick={resetOverlay}>
              <ListItemIcon style={{ minWidth: 0 }}>
                <Replay />
              </ListItemIcon>
              <ListItemText>Reset Overlay</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => toggleShouldClearOverlayState(true)}>
              <ListItemIcon style={{ minWidth: 0 }}>
                <Clear />
              </ListItemIcon>
              <ListItemText>Clear All Marks</ListItemText>
            </MenuItem>
          </>
        }
        disabled={!isResetAllowed}
      />
    </>
  );
}
