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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { useEffect, useState } from 'react';

import { ExtensionConfig } from '../types/ExtensionConfig';

type Props = {
  config: ExtensionConfig;
  isRunning?: boolean;
  isDialogOpen: boolean;
  handleCloseDialog: (newConfig: ExtensionConfig | undefined | null) => void;
};

const Settings: React.FC<Props> = ({
  isDialogOpen,
  isRunning = true,
  handleCloseDialog,
  config,
}) => {
  const [{ portOffset, asyncEnabled, postmanEnabled, aicopilotEnabled, openAiApiKey }, setLocalConfig] = useState(config);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, valueAsNumber, value, checked } = event.target;
    setLocalConfig((prevState) => ({
      ...prevState,
      [name]: name === 'portOffset' ? valueAsNumber : name === 'openAiApiKey' ? value : checked,
    }));
  };

  const handleClose = (newConfig: ExtensionConfig | undefined | null) => {
    handleCloseDialog(newConfig);
    if (!newConfig) {
      setLocalConfig(config);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={(event, reason) => handleClose(null)}
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack justifyContent="center" alignItems="flex-start" spacing={2}>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Checkbox
                  name="asyncEnabled"
                  checked={asyncEnabled}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="subtitle1">
                  Enable Asynchronous APIs
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="postmanEnabled"
                  checked={postmanEnabled}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="subtitle1">
                  Enable testing with Postman
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="aicopilotEnabled"
                  checked={aicopilotEnabled || false}
                  onChange={handleChange}
                />
              }
              label={
                <Typography variant="subtitle1">Enable AI Assistance</Typography>
              }
            />
            {aicopilotEnabled && (
              <TextField
                id="openAiApiKey"
                name="openAiApiKey"
                margin="dense"
                variant="standard"
                type="password"
                label={"OpenAI API Key:"}
                value={openAiApiKey}
                onChange={handleChange}
                helperText="Currently, only OpenAI is implemented"
              />
            )}
          </FormControl>
          <TextField
            id="portoffset"
            name="portOffset"
            margin="normal"
            variant="standard"
            type="number"
            label={"Port Offset"}
            value={portOffset}
            onChange={handleChange}
            helperText="Use an offset to avoid port conflicts"
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
          <Box marginTop={2}>
            <Typography marginTop={2} variant="subtitle1">
              Microcks will use the following ports:
            </Typography>
            <ul>
              <li>
                <code>{8080 + portOffset}</code> for main webapp
              </li>
              <li>
                <code>{9090 + portOffset}</code> for gRPC endpoint
              </li>
              {asyncEnabled && (
                <li>
                  <code>{9092 + portOffset}</code> for Kafka broker
                </li>
              )}
              {asyncEnabled && (
                <li>
                  <code>{8081 + portOffset}</code> for WebSocket endpoint
                </li>
              )}
            </ul>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={(event) => handleClose(null)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={(event) =>
            handleClose({
              asyncEnabled: asyncEnabled,
              postmanEnabled: postmanEnabled,
              aicopilotEnabled: aicopilotEnabled,
              openAiApiKey: openAiApiKey,
              portOffset: portOffset,
            })
          }
        >
          {isRunning ? 'Apply & Restart' : 'Apply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings;
