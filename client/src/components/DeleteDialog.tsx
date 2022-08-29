import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

type Props = {
  open: boolean;
  closeHandler: (event: any, response: string) => void;
};

const DeleteDialog: React.FC<Props> = ({ open, closeHandler }) => {
  return (
    <Dialog
      open={open}
      onClose={(event) => {
        closeHandler(event, 'cancel');
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Delete Microcks?'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This will clean up all the local data related to Microcks and will
          delete the existing containers.
        </DialogContentText>
        <DialogContentText id="alert-dialog-description">
          <span style={{ fontWeight: '700' }}>
            This action can not be undone.
          </span>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(event) => {
            closeHandler(event, 'cancel');
          }}
          autoFocus
        >
          Cancel
        </Button>
        <Button
          onClick={(event) => {
            closeHandler(event, 'delete');
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
