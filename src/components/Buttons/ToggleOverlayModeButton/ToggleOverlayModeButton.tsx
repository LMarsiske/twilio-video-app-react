import React from 'react';
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
import { Gesture, PanTool } from '@material-ui/icons';

import CustomHoverMenu from '../../CustomHoverMenu/CustomHoverMenu';

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

export default function ToggleOverlayModeButton(props: { disabled?: boolean }) {
  const classes = useStyles();
  const { isOverlayDrawable, toggleOverlayDrawable, markers, setMarkers } = useOverlayContext();

  const handleChange = (event: { target: HTMLInputElement }) => {
    console.log('handling change');
    const name: string = event.target.name;
    const checked: boolean = event.target.checked;
    let copy = [...markers];
    let index = copy.findIndex(el => el.id === name);
    copy[index] = { id: name, active: checked };
    setMarkers(copy);
  };

  return (
    <>
      <Tooltip title={isOverlayDrawable ? 'Adjust' : 'Draw'} placement="top" PopperProps={{ disablePortal: true }}>
        <span>
          {/* The span element is needed because a disabled button will not emit hover events and we want to display
          a tooltip when screen sharing is disabled */}
          <Button
            className={classes.button}
            onClick={toggleOverlayDrawable}
            startIcon={isOverlayDrawable ? <PanTool /> : <Gesture />}
            data-cy-share-screen
            style={{ paddingRight: 0 }}
          >
            {isOverlayDrawable ? 'Adjust Overlay' : 'Start Drawing'}
          </Button>
        </span>
      </Tooltip>
      <CustomHoverMenu
        children={markers.map((marker, index) => (
          <MenuItem key={index}>
            <FormControlLabel
              control={<Checkbox checked={marker.active} onChange={handleChange} name={marker.id} />}
              label={marker.id.toUpperCase()}
            />
          </MenuItem>
        ))}
      />
    </>
  );
}
