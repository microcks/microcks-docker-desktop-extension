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
import { ExtensionConfig } from '../types/ExtensionConfig';

const ImportDialog: React.FC<{
  isDialogOpen: boolean;
  config: ExtensionConfig;
  closeHandler: (refresh?:boolean) => void;
}> = ({ isDialogOpen, config, closeHandler }) => {
  const [fileToUpload, setFileToUpload] = useState<File>();
  const [isSecondary, setIsSecondary] = useState(false);

  const uploadFile = async (event: React.MouseEvent<HTMLElement>) => {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload as File);

      const result = await fetch(
        `http://localhost:${
          8080 + config.portOffset || 8080
        }/api/artifact/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (result.ok) {
        closeHandler(true)
      }
    } catch (error) {}
  };

  const handleClose = () => {
    closeHandler();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileToUpload(event.target.files?.[0]);
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
          onClick={uploadFile}
          disabled={fileToUpload === undefined}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
