import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import UploadIcon from '@mui/icons-material/Upload';
import React, { useState } from 'react';

const ImportDialog: React.FC<{
  isDialogOpen: boolean;
  closeHandler: () => void;
}> = ({ isDialogOpen, closeHandler }) => {
  const [file, setFile] = useState<File>();
  const [isSecondary, setIsSecondary] = useState(false);

  const handleClose = () => {
    closeHandler();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0]);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSecondary(event.target.checked);
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={(event, reason) => closeHandler()}
      fullWidth
    >
      <DialogTitle>Upload Artifact</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="artifact"
          type="file"
          fullWidth
          onChange={handleInputChange}
        />
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSecondary}
                onChange={handleCheckboxChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label="This is a secondary artifact"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={(event) => handleClose()}>
          Cancel
        </Button>
        <Button
          startIcon={<UploadIcon />}
          variant="contained"
          color="primary"
          size="large"
          onClick={(event) => {}}
          disabled={file === undefined}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
