import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Fade } from '@material-ui/core';

import Button from '@material-ui/core/Button';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import { isMobile } from '../../utils';
import Menu from './Menu/Menu';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useOverlayContext from '../../hooks/useOverlayContext/useOverlayContext';
import { useAppState } from '../../state';
import { Typography, Grid, Hidden } from '@material-ui/core';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleChatButton from '../Buttons/ToggleChatButton/ToggleChatButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import ToggleScreenShareButton from '../Buttons/ToogleScreenShareButton/ToggleScreenShareButton';
import ToggleOverlayModeButton from '../Buttons/ToggleOverlayModeButton/ToggleOverlayModeButton';
import SaveOverlayButton from '../Buttons/SaveOverlayButton/SaveOverlayButton';
import ClearOverlayButton from '../Buttons/ClearOverlayButton/ClearOverlayButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${theme.footerHeight}px`,
      position: 'fixed',
      display: 'flex',
      padding: '0 1.43em',
      zIndex: 10,
      [theme.breakpoints.down('sm')]: {
        height: `${theme.mobileFooterHeight}px`,
        padding: 0,
      },
    },
    screenShareBanner: {
      position: 'fixed',
      zIndex: 9999,
      bottom: `${theme.footerHeight}px`,
      left: 0,
      right: 0,
      height: '104px',
      background: 'rgba(0, 0, 0, 0.5)',
      '& h6': {
        color: 'white',
      },
      '& button': {
        background: 'white',
        color: theme.brand,
        border: `2px solid ${theme.brand}`,
        margin: '0 2em',
        '&:hover': {
          color: '#600101',
          border: `2px solid #600101`,
          background: '#FFE9E7',
        },
      },
    },
    hideMobile: {
      display: 'initial',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  })
);

export default function MenuBar() {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare } = useVideoContext();

  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const { room } = useVideoContext();
  const { isAdmin } = useAppState();

  return (
    <>
      {isSharingScreen && (
        <Grid container justifyContent="center" alignItems="center" className={classes.screenShareBanner}>
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}
      <footer className={classes.container}>
        <Grid container justifyContent="space-around" alignItems="center">
          <Hidden smDown>
            <Grid style={{ flex: 1 }}>
              <ToggleAudioButton disabled={isReconnecting} />
              <ToggleVideoButton disabled={isReconnecting} />
              <Menu />
            </Grid>
          </Hidden>
          {isAdmin ? (
            <Grid item>
              <Grid container justifyContent="center">
                <ToggleOverlayModeButton />
                <SaveOverlayButton />
                <ClearOverlayButton />
              </Grid>
            </Grid>
          ) : null}
          <Hidden smDown>
            <Grid style={{ flex: 1 }}>
              <Grid container justifyContent="flex-end">
                <EndCallButton />
              </Grid>
            </Grid>
          </Hidden>
        </Grid>
      </footer>
    </>
  );
}
