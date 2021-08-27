import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  makeStyles,
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
  TextField,
  InputAdornment,
  IconButton,
  OutlinedInput,
  InputLabel,
} from '@material-ui/core';

import { Clear } from '@material-ui/icons';
import Konva from 'konva';

import useOverlayContext from '../../hooks/useOverlayContext/useOverlayContext';

import { useAppState } from '../../state';

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

interface SaveVideoOverlayDialogProps {
  overlay: { group: Konva.Group; url: string } | null;
  open: boolean;
  onClose: () => void;
}

export default function SaveVideoOverlayDialog({ open, onClose, overlay }: SaveVideoOverlayDialogProps) {
  const classes = useStyles();
  const theme = useTheme();
  let isStacked = useMediaQuery(theme.breakpoints.down('sm'));
  const { saveVirtualGridOverlay } = useAppState();

  const [overlayImg, setOverlayImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    console.log(open, onClose, overlay);
    if (overlay) {
      overlay.group.toImage({
        pixelRatio: 2,
        callback: img => {
          setOverlayImg(img);
        },
      });
    }
  }, [overlay]);

  const confirmSave = () => {
    saveVirtualGridOverlay(fileName, overlay!.url);
    onClose();
    setFileName('');
  };

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.paper, container: classes.container, root: classes.root }}
      fullScreen={true}
    >
      <DialogTitle>Video Overlay Settings</DialogTitle>
      <Divider />
      <DialogContent className={classes.contents} id="dialogcontentcontainer">
        <div className={classes.listSection}>
          {overlayImg && <img src={overlayImg.src} width="90%" />}
          <FormControl variant="outlined" style={{ marginTop: '3%', width: '70%' }}>
            <InputLabel>File Name</InputLabel>
            <OutlinedInput
              type="text"
              value={fileName}
              style={{ width: '100%' }}
              onChange={onTextChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setFileName('')} disabled={fileName === ''} edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              }
              labelWidth={85}
            />
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
      <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          className={classes.button}
          onClick={onClose}
          style={{ backgroundColor: '#680000', color: 'white' }}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          className={classes.button}
          onClick={confirmSave}
          disabled={!fileName || !overlay}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
