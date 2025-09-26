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
import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import { ExtensionConfig } from '../../types/ExtensionConfig';
import { ContainerStatus } from '../../types/ContainerStatus';
import ClipboardCopy from '../ClipboardCopy';
import Services from '../Services';
import Footer from '../Footer';
import { useDockerDesktopClient } from '../../utils/ddclient';

interface RunningViewProps {
  config: ExtensionConfig;
  appStatus: ContainerStatus;
  onStopMicrocks: () => void;
  onOpenSettings: () => void;
  onDeleteMicrocks: () => void;
}

const RunningView: React.FC<RunningViewProps> = ({
  config,
  appStatus,
  onStopMicrocks,
  onOpenSettings,
  onDeleteMicrocks,
}) => {
  const ddClient = useDockerDesktopClient();
  const microcksUrl = `http://localhost:${8080 + config.portOffset}/#/`;

  const handleOpenExternal = () => {
    ddClient.host.openExternal(microcksUrl);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      height="95vh"
    >
      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }} my={1}>
        <Box alignContent="flex-start" textAlign="left" flexGrow={1}>
          <Typography sx={{ fontWeight: 'bolder' }} variant="h5">
            Microcks
          </Typography>
          <Typography variant="subtitle1" color="InactiveCaptionText">
            API Mocking and Testing for REST, GraphQL, gRPC and AsyncAPI
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Settings">
            <IconButton onClick={onOpenSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box m={2}>
          <Button variant="contained" color="error" onClick={onStopMicrocks}>
            Stop Microcks
          </Button>
        </Box>
      </Box>
      <Paper
        elevation={3}
        sx={{
          marginTop: 4,
          padding: 2,
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Chip variant="filled" color="success" label="RUNNING" />
        <Box alignContent="center" display="flex" alignItems="center" mx={1}>
          <DoneOutlinedIcon />
        </Box>
        <Box
          flexGrow={1}
          alignContent="center"
          display="flex"
          alignItems="center"
        >
          <Typography variant="subtitle1" component="span">
            Microcks is running. To access the UI navigate to:{' '}
            <Link
              onClick={handleOpenExternal}
              variant="subtitle1"
              component="span"
            >
              {microcksUrl}
            </Link>
            <IconButton
              onClick={handleOpenExternal}
              component="span"
              size="small"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
            <ClipboardCopy copyText={microcksUrl} size="small" />
          </Typography>
        </Box>
      </Paper>
      <Services config={config} />
      <Footer>
        {appStatus.exists && (
          <Link onClick={onDeleteMicrocks} component="button">
            Delete Microcks
          </Link>
        )}
      </Footer>
    </Box>
  );
};

export default RunningView;
