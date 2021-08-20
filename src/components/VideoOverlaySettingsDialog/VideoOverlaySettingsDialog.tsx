import React from 'react';
import _ from 'lodash';
import AudioInputList from './AudioInputList/AudioInputList';
import AudioOutputList from './AudioOutputList/AudioOutputList';
import {
  useTheme,
  useMediaQuery,
  DialogContent,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  Button,
  Theme,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VideoInputList from './VideoInputList/VideoInputList';

import useOverlayContext from '../../hooks/useOverlayContext/useOverlayContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '90%',
    height: '90%',
  },
  contents: {
    // width: '600px',
    // minHeight: '400px',
    // [theme.breakpoints.down('xs')]: {
    //   width: 'calc(100vw - 32px)',
    // },
    // '& .inputSelect': {
    //   width: 'calc(100% - 35px)',
    // },
    width: '100%',
    height: '100%',
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'space-evenly',
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  button: {
    float: 'right',
  },
  paper: {
    [theme.breakpoints.down('xs')]: {
      margin: '16px',
    },
  },
  headline: {
    marginBottom: '1.3em',
    fontSize: '1.1rem',
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    maxWidth: '45%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      minHeight: '800px',
      maxWidth: '100%',
    },
  },
}));

export default function VideoOverlaySettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { markers, setMarkers } = useOverlayContext();
  const classes = useStyles();
  const theme = useTheme();
  let isStacked = useMediaQuery(theme.breakpoints.down('sm'));
  //console.log(isStacked);

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
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.paper, container: classes.container, root: classes.root }}
      id="isthistherootdialog"
      fullScreen={true}
    >
      <DialogTitle>Video Overlay Settings</DialogTitle>
      <Divider />
      <DialogContent className={classes.contents} id="dialogcontentcontainer">
        <div className={classes.listSection}>
          <Typography variant="h6" className={classes.headline}>
            Landmarks
          </Typography>
          <FormControl component="fieldset">
            <FormGroup row>
              {markers.map((marker, index) => (
                <FormControlLabel
                  control={<Checkbox checked={marker.active} onChange={handleChange} name={marker.id} />}
                  label={marker.id.toUpperCase()}
                />
              ))}
            </FormGroup>
          </FormControl>
        </div>
        {/* <div className={classes.listSection}>
          <Typography variant="h6" className={classes.headline}>
            Video
          </Typography>
          <VideoInputList />
        </div>
        {isStacked ? (
          <Divider variant="middle" style={{ width: '100%' }} />
        ) : (
          <Divider orientation="vertical" flexItem />
        )}
        <div className={classes.listSection}>
          <Typography variant="h6" className={classes.headline}>
            Audio
          </Typography>
          <VideoInputList />
        </div> */}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button color="primary" variant="contained" className={classes.button} onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
