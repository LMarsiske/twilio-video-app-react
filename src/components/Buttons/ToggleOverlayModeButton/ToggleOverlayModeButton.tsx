import React, { useState } from 'react';
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
  FormLabel,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@material-ui/core';
import { Gesture, PanTool, SwitchCameraTwoTone } from '@material-ui/icons';

import CustomHoverMenu from '../../CustomHoverMenu/CustomHoverMenu';

import CustomColorPicker from '../../CustomColorPicker/CustomColorPicker';

import useOverlayContext from '../../../hooks/useOverlayContext/useOverlayContext';
import { Color, ColorChangeHandler, ColorResult } from 'react-color';

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
  const {
    isOverlayDrawable,
    toggleOverlayDrawable,
    markers,
    setMarkers,
    gridColor,
    setGridColor,
    strokeColor,
    setStrokeColor,
    markerColor,
    setMarkerColor,
  } = useOverlayContext();

  const [openGridColorPicker, setOpenGridColorPicker] = useState(false);
  const [openLandmarkColorPicker, setOpenLandmarkColorPicker] = useState(false);
  const [openMarkerColorPicker, setOpenMarkerColorPicker] = useState(false);

  const handleLandmarkChange = (event: { target: HTMLInputElement }) => {
    console.log('handling change');
    const name: string = event.target.name;
    const checked: boolean = event.target.checked;
    let copy = [...markers];
    let index = copy.findIndex(el => el.id === name);
    copy[index] = { id: name, active: checked };
    setMarkers(copy);
  };

  const onSelectedMenuItem = (comp: string) => {
    switch (comp) {
      case 'grid':
        setOpenGridColorPicker(true);
        break;
      case 'landmark':
        setOpenLandmarkColorPicker(true);
        break;
      case 'marker':
        setOpenMarkerColorPicker(true);
        break;
      default:
        break;
    }
  };

  const handleGridColorChange = React.useCallback((color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(color);
    setGridColor(color.hex);
  }, []);
  const handleLandmarkColorChange = React.useCallback(
    (color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(color);
      setMarkerColor(color.hex);
    },
    []
  );
  const handleMarkerColorChange = React.useCallback(
    (color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(color);
      setStrokeColor(color.hex);
    },
    []
  );

  const handleClose = (comp: string) => {
    switch (comp) {
      case 'grid':
        setOpenGridColorPicker(false);
        break;
      case 'landmark':
        setOpenLandmarkColorPicker(false);
        break;
      case 'marker':
        setOpenMarkerColorPicker(false);
        break;
      default:
        break;
    }
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
      {/* <CustomColorPicker
        open={openGridColorPicker}
        color={gridColor}
        onChange={handleGridColorChange}
        handleClose={() => handleClose('grid')}
      /> */}
      <CustomHoverMenu
        // children={markers.map((marker, index) => (
        //   <MenuItem key={index}>
        //     <FormControlLabel
        //       control={<Checkbox checked={marker.active} onChange={handleChange} name={marker.id} />}
        //       label={marker.id.toUpperCase()}
        //     />
        //   </MenuItem>
        // ))}
        children={[
          <MenuItem
            key={0}
            // button
            // onClick={() => {
            //   onSelectedMenuItem('grid');
            // }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <Typography>Change Grid Color</Typography>
            <CustomColorPicker color={gridColor} onChange={handleGridColorChange} />
          </MenuItem>,
          <MenuItem key={1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography>Change Landmark Color</Typography>
            <CustomColorPicker color={markerColor} onChange={handleLandmarkColorChange} />
          </MenuItem>,
          <MenuItem key={2} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography>Change Marker Color</Typography>
            <CustomColorPicker color={strokeColor} onChange={handleMarkerColorChange} />
          </MenuItem>,
          <MenuItem key={3}>
            <FormControl component="fieldset" style={{ display: 'flex', flexDirection: 'row' }}>
              <FormLabel component="legend">Landmarks</FormLabel>
              {markers.map((marker, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox checked={marker.active} onChange={handleLandmarkChange} name={marker.id} />}
                  label={marker.id.toUpperCase()}
                />
              ))}
            </FormControl>
          </MenuItem>,
        ]}
      />
    </>
  );
}
