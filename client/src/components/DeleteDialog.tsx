/*
 * Licensed to Laurent Broudoux (the "Author") under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. Author licenses this
 * file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
