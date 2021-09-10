import React, { useRef, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  Button,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import { Clear, ExpandLess, ExpandMore } from '@material-ui/icons';

import HoverMenu from 'material-ui-popup-state/HoverMenu';
import { usePopupState, bindHover, bindMenu } from 'material-ui-popup-state/hooks';

import useOverlayContext from '../../hooks/useOverlayContext/useOverlayContext';

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

interface CustomHoverMenuProps {
  disabled?: boolean;
  tightFit?: boolean;
  children?: React.ReactNode;
}

export default function CustomHoverMenu({ disabled = false, tightFit = true, children }: CustomHoverMenuProps) {
  const classes = useStyles();
  const { isResetAllowed, setMarkers } = useOverlayContext();
  const isDisabled = false;
  let tooltipMessage = '';
  if (!isResetAllowed) {
    tooltipMessage = 'The overlay cannot be cleared until it has been saved at least once.';
  }

  const popupState = usePopupState({ variant: 'popover', popupId: 'test' });

  return (
    <>
      <IconButton style={{ padding: tightFit ? 0 : '16px' }} {...bindHover(popupState)} disabled={disabled}>
        <ExpandLess />
      </IconButton>
      <HoverMenu
        {...bindMenu(popupState)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {children}
      </HoverMenu>
    </>
  );
}
