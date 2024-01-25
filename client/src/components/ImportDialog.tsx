/*
 * Copyright The Microcks Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import UploadIcon from '@mui/icons-material/Upload';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { throwErrorAsString } from '../api/utils';
import { ExtensionConfig } from '../types/ExtensionConfig';

const ImportDialog: React.FC<{
  isDialogOpen: boolean;
  config: ExtensionConfig;
  closeHandler: (refresh?: boolean) => void;
}> = ({ isDialogOpen, config, closeHandler }) => {
  const [fileToUpload, setFileToUpload] = useState<File>();
  const [isSecondary, setIsSecondary] = useState(false);

  const uploadFile = async (event: React.MouseEvent<HTMLElement>) => {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload as File);
      formData.append('mainArtifact', isSecondary ? 'false' : 'true');

      const response = await fetch(
        `http://localhost:${
          8080 + config.portOffset || 8080
        }/api/artifact/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        console.error(response.statusText);
        return;
      }

      handleClose(true);
    } catch (error) {
      throwErrorAsString(error);
    }
  };

  const handleClose = (refresh?: boolean) => {
    setFileToUpload(undefined);
    setIsSecondary(false);
    closeHandler(refresh);
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
      onClose={(event, reason) => handleClose()}
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
