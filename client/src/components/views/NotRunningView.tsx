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
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import { ContainerStatus } from '../../types/ContainerStatus';
import Footer from '../Footer';

interface NotRunningViewProps {
  uiMode: string;
  appStatus: ContainerStatus;
  onLaunchMicrocks: () => void;
  onOpenSettings: () => void;
  onDeleteMicrocks: () => void;
}

const NotRunningView: React.FC<NotRunningViewProps> = ({
  uiMode,
  appStatus,
  onLaunchMicrocks,
  onOpenSettings,
  onDeleteMicrocks,
}) => {
  return (
    <>
      <Stack
        sx={{
          display: 'flex',
          flexGrow: 1,
          height: '90vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          m={4}
          sx={{
            width: 450,
            maxWidth: { xs: 450, md: 350 },
          }}
          component="img"
          src={
            uiMode === 'light'
              ? 'assets/images/microcks-logo-blue-baseline-tweet.png'
              : 'assets/images/microcks-logo-white-baseline-tweet.png'
          }
          alt="Microcks Logo"
        />
        <Paper
          elevation={3}
          sx={{
            margin: 4,
            padding: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {!appStatus.isRunning && (
            <Chip variant="outlined" color="error" label="STOPPED" />
          )}
          <Box
            alignContent="center"
            display="flex"
            alignItems="center"
            mx={1}
          >
            <RocketLaunchIcon />
          </Box>
          <Box
            flexGrow={1}
            alignContent="center"
            display="flex"
            alignItems="center"
          >
            <Typography variant="subtitle1">
              Microcks is not running. First launch can take some time while
              we're pulling the container images.
            </Typography>
          </Box>
          <Box
            flexGrow={1}
            alignContent="center"
            display="flex"
            alignItems="center"
          ></Box>
        </Paper>
        <Stack m={2} spacing={2} direction="row">
          <Button
            variant="outlined"
            size="large"
            startIcon={<SettingsIcon />}
            onClick={onOpenSettings}
          >
            Settings
          </Button>
          <Button variant="contained" size="large" onClick={onLaunchMicrocks}>
            Launch Microcks
          </Button>
        </Stack>
      </Stack>
      <Footer>
        {appStatus.exists && (
          <Link onClick={onDeleteMicrocks} component="button">
            Delete Microcks
          </Link>
        )}
      </Footer>
    </>
  );
};

export default NotRunningView;