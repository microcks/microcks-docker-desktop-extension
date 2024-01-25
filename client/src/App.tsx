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
import React, { useEffect, useState } from 'react';

import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { ExecStreamOptions } from '@docker/extension-api-client-types/dist/v1';
import './App.css';
import {
  getExtensionConfig,
  getHome,
  initializeFileSystem,
  writeExtensionConfig,
  writePropertiesFiles,
} from './api/config';
import { getContainerInfo } from './api/containers';
import { sendMetric } from './api/metrics';
import { ensureNetworkExists } from './api/network';
import { ensureVolumeExists } from './api/volume';
import AlertDialog from './components/AlertDialog';
import ClipboardCopy from './components/ClipboardCopy';
import DeleteDialog from './components/DeleteDialog';
import Footer from './components/Footer';
import ImportDialog from './components/ImportDialog';
import Services from './components/Services';
import SettingsDialog from './components/Settings';
import { ContainerStatus } from './types/ContainerStatus';
import { ExtensionConfig } from './types/ExtensionConfig';
import {
  APP_CONTAINER,
  ASYNC_MINION_CONTAINER,
  EXTENSION_NETWORK,
  KAFKA_CONTAINER,
  POSTMAN_CONTAINER
} from './utils/constants';
import { useDockerDesktopClient } from './utils/ddclient';

const isWindows = () => {
  const platform = useDockerDesktopClient().host.platform;
  console.log('Current platform: [%s]', platform);
  const windowsSystem = platform.toLowerCase().startsWith('win');
  return windowsSystem;
};

const App = () => {
  const ddClient = useDockerDesktopClient();

  const [uiMode, setUIMode] = useState({} as string);

  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsDialog, setIsSettingsDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  const [alertDialogData, setAlertDialogData] = useState({title:'',text:''});

  const [appStatus, setAppStatus] = useState({} as ContainerStatus);
  const [postmanStatus, setPostmanStatus] = useState({} as ContainerStatus);
  const [kafkaStatus, setKafkaStatus] = useState({} as ContainerStatus);
  const [asyncMinionStatus, setAsyncMinionStatus] = useState(
    {} as ContainerStatus,
  );

  const [status, setStatus] = useState<
    'INITIALIZING' | 'RUNNING' | 'NOT_RUNNING'
  >('INITIALIZING');
  const [launched, setLaunched] = useState(false);
  const [isReady, setIsReady] = useState<boolean>();

  const [healthCheckInterval, setHealthCheckInterval] = useState<number>();

  const [appDir, setAppDir] = useState('');
  const [config, setConfig] = useState<ExtensionConfig>({} as ExtensionConfig);

  useEffect(() => {
    const isSystemInDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    console.log('isSystemInDarkMode? ' + isSystemInDarkMode);
    setUIMode(isSystemInDarkMode ? 'dark' : 'light');
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        const colorScheme = event.matches ? 'dark' : 'light';
        console.log('colorScheme change: ' + colorScheme);
        setUIMode(colorScheme);
      });
  }, []);

  useEffect(() => {
    console.log('Loading Microcks Extension for Docker Desktop.');

    initializeFileSystem().then((result) => {
      if (result) {
        initializeExtension();
        sendMetric('microcks_extension_opened', {});
      }
      // TODO: managed this low level error that prevent extension initialization.
    });
  }, []);

  useEffect(() => {
    console.log('useEffect() appStatus', appStatus);
    console.log('useEffect() isReady', isReady);
    console.log('useEffect() launched', launched);
    if (Object.keys(appStatus).length == 0) {
      console.log('init appStatus');
      return;
    }
    if (appStatus.isRunning) {
      if (isLoading) {
        ddClient.desktopUI.toast.success('Microcks is starting...');
      }
      if (!isReady) {
        /* Check health */
        const interval = window.setInterval(checkHealth, 1000);
        setHealthCheckInterval(interval);
      }
    } else {
      setIsReady(false);
      if (!launched) {
        setIsLoading(false);
      }
    }
  }, [appStatus]);

  useEffect(() => {
    console.log('new config:', config);
    console.log('launched:', launched);

    const launch = async () => {
      const res = await launchMicrocks();
      setLaunched(false);
    };

    if (launched) {
      setIsLoading(true);
      launch().catch(console.error);
    }
  }, [launched]);

  useEffect(() => {
    console.log('isReady changed', isReady);
    if (isReady == undefined) {
      console.log('init isReady');
      return;
    }
    if (healthCheckInterval) {
      window.clearInterval(healthCheckInterval);
      setHealthCheckInterval(undefined);
    }
    if (isReady) {
      setStatus('RUNNING');
    } else {
      setStatus('NOT_RUNNING');
    }
  }, [isReady]);

  useEffect(() => {
    console.log('isLoading changed', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('status changed', status);
  }, [status]);

  const initializeExtension = () => {
    getHome().then((result) => {
      console.log('Home path: ' + result);
      if (result != null) {
        result = result.replace(/\n/g, '').replace(/\r/g, '');
        const dir =
          result +
          (isWindows() ? '\\' : '/') +
          '.microcks-docker-desktop-extension';
        console.log('Extension dir: ' + dir);
        setAppDir(dir);
      }
    });

    getExtensionConfig().then((result) => {
      const conf = result;
      setConfig(conf);
      console.log('Extension config: ' + JSON.stringify(conf));
      writePropertiesFiles(conf);
    });

    getContainerInfo(APP_CONTAINER).then((info) => setAppStatus(info));
    getContainerInfo(POSTMAN_CONTAINER).then((info) => setPostmanStatus(info));
    getContainerInfo(KAFKA_CONTAINER).then((info) => setKafkaStatus(info));
    getContainerInfo(ASYNC_MINION_CONTAINER).then((info) =>
      setAsyncMinionStatus(info),
    );
  };

  const launchMicrocks = async (event?: React.MouseEvent<HTMLSpanElement>) => {
    console.log('Launch Microcks!');
    sendMetric('microcks_extension_launched', {
      asyncEnabled: config.asyncEnabled,
      postmanEnabled: config.postmanEnabled,
      portOffset: config.portOffset,
    });

    setIsLoading(true);

    /*
    // Simple docker run command from docker-decompose ;-)
    docker run -d --name "mongo" -v "~/tmp/microcks-data:/data/db" "mongo:3.4.23"
    docker run -d --name "postman" "quay.io/microcks/microcks-postman-runtime:latest"
    docker run -d --name "kafka" -p "9092:9092" -p "19092:19092" "vectorized/redpanda:v21.10.2" "redpanda start --overprovisioned --smp 1  --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092"
    docker run -d --name "app" -e "SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *" -e "SPRING_PROFILES_ACTIVE=prod" -e "KEYCLOAK_ENABLED=false" -e "KAFKA_BOOTSTRAP_SERVER=kafka:19092" -e "SPRING_DATA_MONGODB_URI=mongodb://mongo:27017" -e "TEST_CALLBACK_URL=http://microcks:8080" -e "SPRING_DATA_MONGODB_DATABASE=microcks" -e "ASYNC_MINION_URL=http://microcks-async-minion:8081" -e "POSTMAN_RUNNER_URL=http://postman:3000" -p "8080:8080" -p "9090:9090" -v "./config:/deployments/config" "quay.io/microcks/microcks:latest"
    docker run -d --name "async-minion" -e "QUARKUS_PROFILE=docker-compose" -p "8081:8081" --restart "on-failure" -v "./config:/deployments/config" "quay.io/microcks/microcks-async-minion:latest"
    */

    const res = await ensureNetworkExists();
    console.log('network result', res);

    if (res) {
      const volumeRes = await ensureVolumeExists();
      console.log('volume result', volumeRes);

      if (volumeRes) {
        const volumeDir = isWindows()
          ? `//${appDir.replace(/\\/g, '/').replace('C:', 'c')}`
          : appDir;

        console.log('appstatus', appStatus);
        if (appStatus && !appStatus.isRunning) {
          const params = [
            '-d',
            '--name',
            APP_CONTAINER,
            '--network',
            EXTENSION_NETWORK,
            '--hostname',
            APP_CONTAINER,
            '-v',
            volumeDir + '/config:/deployments/config',
            '-v',
            volumeDir + '/data:/data',
            '-e',
            'JAVA_OPTIONS=-XX:+TieredCompilation -XX:TieredStopAtLevel=2',
            '-e',
            'JAVA_MAJOR_VERSION=11',
            '-e',
            'SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *',
            '-e',
            'SPRING_PROFILES_ACTIVE=uber',
            '-e',
            'KEYCLOAK_ENABLED=false',
            '-e',
            `KAFKA_BOOTSTRAP_SERVER=${KAFKA_CONTAINER}:19092`,
            '-e',
            `MONGODB_STORAGE_PATH=/data/microcks.mv`,
            '-e',
            `TEST_CALLBACK_URL=http://${APP_CONTAINER}:8080`,
            '-e',
            `ASYNC_MINION_URL=http://${ASYNC_MINION_CONTAINER}:8081`,
            '-e',
            `POSTMAN_RUNNER_URL=http://${POSTMAN_CONTAINER}:3000`,
            '-p',
            `${8080 + config.portOffset}:8080`,
            '-p',
            `${9090 + config.portOffset}:9090`,
            '--label',
            'com.docker.compose.project=microcks_microcks-docker-desktop-extension-desktop-extension',
            'quay.io/microcks/microcks-uber:latest-extension',
          ];
          if (!appStatus.exists) {
            console.log('Creating ', APP_CONTAINER);
            const result = await runContainer(
              APP_CONTAINER,
              params,
              setAppStatus,
            );
          } else {
            if (appStatus.mappedPort != 8080 + config.portOffset) {
              const removeRes = await removeContainer(APP_CONTAINER);
              const runRes = await runContainer(
                APP_CONTAINER,
                params,
                setAppStatus,
              );
            } else {
              startContainer(APP_CONTAINER);
            }
          }
        }

        if (config.postmanEnabled) {
          console.log(
            'Postman configuration is enabled, launching postman runtime container...',
          );
          console.log('postmanstatus', postmanStatus);
          if (postmanStatus && !postmanStatus.isRunning) {
            if (!postmanStatus.exists) {
              console.log('Creating ', POSTMAN_CONTAINER);
              const postmanRes = ddClient.docker.cli.exec(
                'run',
                [
                  '-d',
                  '--name',
                  POSTMAN_CONTAINER,
                  '--network',
                  EXTENSION_NETWORK,
                  '--hostname',
                  POSTMAN_CONTAINER,
                  '--label',
                  'com.docker.compose.project=microcks_microcks-docker-desktop-extension-desktop-extension',
                  'quay.io/microcks/microcks-postman-runtime:latest',
                ],
                {
                  stream: buildStreamingOpts(POSTMAN_CONTAINER, setPostmanStatus),
                },
              );
            } else {
              startContainer(POSTMAN_CONTAINER);
            }
          }
        } 

        if (config.asyncEnabled) {
          console.log(
            'Async configuration is enabled, launching async related containers...',
          );
          if (kafkaStatus && !kafkaStatus.isRunning) {
            const params = [
              '-d',
              '--name',
              KAFKA_CONTAINER,
              '--network',
              EXTENSION_NETWORK,
              '--label',
              'com.docker.compose.project=microcks_microcks-docker-desktop-extension-desktop-extension',
              '--hostname',
              KAFKA_CONTAINER,
              '-p',
              `${9092 + config.portOffset}:${9092 + config.portOffset}`,
              '-p',
              '19092:19092',
              'vectorized/redpanda:v22.2.2',
              `redpanda start --overprovisioned --smp 1 --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:${
                9092 + config.portOffset
              } --advertise-kafka-addr PLAINTEXT://${KAFKA_CONTAINER}:19092,EXTERNAL://localhost:${
                9092 + config.portOffset
              }`,
            ];
            if (!kafkaStatus.exists) {
              console.log('Creating ', KAFKA_CONTAINER);
              const result = await runContainer(
                KAFKA_CONTAINER,
                params,
                setKafkaStatus,
              );
            } else {
              if (kafkaStatus.mappedPort != 9092 + config.portOffset) {
                const removeRes = await removeContainer(KAFKA_CONTAINER);
                const runRes = await runContainer(
                  KAFKA_CONTAINER,
                  params,
                  setKafkaStatus,
                );
              } else {
                startContainer(KAFKA_CONTAINER);
              }
            }
          }

          if (asyncMinionStatus && !asyncMinionStatus.isRunning) {
            if (!asyncMinionStatus.exists) {
              console.log('Creating ', ASYNC_MINION_CONTAINER);
              const minionRes = ddClient.docker.cli.exec(
                'run',
                [
                  '-d',
                  '--name',
                  ASYNC_MINION_CONTAINER,
                  '--network',
                  EXTENSION_NETWORK,
                  '--hostname',
                  ASYNC_MINION_CONTAINER,
                  '-v',
                  volumeDir + '/config:/deployments/config',
                  '-e',
                  'QUARKUS_PROFILE=docker-compose',
                  '-e',
                  'MICROCKS_HOST_PORT=microcks:8080',
                  '--restart',
                  'on-failure',
                  '-p',
                  `${8081 + config.portOffset}:8081`,
                  '--label',
                  'com.docker.compose.project=microcks_microcks-docker-desktop-extension-desktop-extension',
                  'quay.io/microcks/microcks-uber-async-minion:latest-extension',
                ],
                {
                  stream: buildStreamingOpts(
                    ASYNC_MINION_CONTAINER,
                    setAsyncMinionStatus,
                  ),
                },
              );
            } else {
              const minionRes = ddClient.docker.cli.exec('start', [
                ASYNC_MINION_CONTAINER,
              ]);
            }
          }
        }
      } else {
        // TODO: Manage this low-level error.
        console.error('Error while ensuring extension volume exists');
      }
    } else {
      // TODO: Manage this low-level error.
      console.error('Error while ensuring extension network exists');
    }
  };

  const runContainer = async (
    container: string,
    params: string[],
    status: React.Dispatch<React.SetStateAction<ContainerStatus>>,
  ) => {
    const appRes = ddClient.docker.cli.exec('run', params, {
      stream: buildStreamingOpts(container, status),
    });
  };

  const removeContainer = async (container: string, trigger?: boolean) => {
    console.log('Deleting ', container);
    const result = await ddClient.docker.cli.exec('rm', ['-v', container]);
    if (!result.code && trigger) {
      switch (container) {
        case APP_CONTAINER:
          setAppStatus({ ...appStatus, exists: false });
          break;
        case POSTMAN_CONTAINER:
          setPostmanStatus({ ...postmanStatus, exists: false });
          break;
        case KAFKA_CONTAINER:
          setKafkaStatus({ ...kafkaStatus, exists: false });
          break;
        case ASYNC_MINION_CONTAINER:
          setAsyncMinionStatus({ ...asyncMinionStatus, exists: false });
          break;

        default:
          break;
      }
    }
    return result;
  };

  const startContainer = async (container: string) => {
    console.log('Starting ', container);
    try {
      const result = await ddClient.docker.cli.exec('start', [container]);
      if (!result.code) {
        switch (container) {
          case APP_CONTAINER:
            setAppStatus({ ...appStatus, isRunning: true });
            break;
          case POSTMAN_CONTAINER:
            setPostmanStatus({ ...postmanStatus, isRunning: true });
            break;
          case KAFKA_CONTAINER:
            setKafkaStatus({ ...kafkaStatus, isRunning: true });
            break;
          case ASYNC_MINION_CONTAINER:
            setAsyncMinionStatus({ ...asyncMinionStatus, isRunning: true });
            break;

          default:
            break;
        }
      }
    } catch (error: any) {
      console.error(error.stderr);
      handleLaunchFailure();
    }
  };

  const stopContainer = async (container: string, trigger?: boolean) => {
    console.log('Stopping ', container);
    const result = await ddClient.docker.cli.exec('stop', [container]);
    if (!result.code && trigger) {
      switch (container) {
        case APP_CONTAINER:
          setAppStatus({ ...appStatus, isRunning: false });
          break;
        case POSTMAN_CONTAINER:
          setPostmanStatus({ ...postmanStatus, isRunning: false });
          break;
        case KAFKA_CONTAINER:
          setKafkaStatus({ ...kafkaStatus, isRunning: false });
          break;
        case ASYNC_MINION_CONTAINER:
          setAsyncMinionStatus({ ...asyncMinionStatus, isRunning: false });
          break;

        default:
          break;
      }
    }
    return result;
  };

  const stopMicrocks = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Stopping Microcks...');
    sendMetric('microcks_extension_stopped', {
      asyncEnabled: config.asyncEnabled,
      postmanEnabled: config.postmanEnabled,
      portOffset: config.portOffset,
    });

    setIsLoading(true);
    if (event) {
      ddClient.desktopUI.toast.success('Stopping Microcks...');
    }
    const result = await ddClient.docker.cli.exec('stop', [
      APP_CONTAINER,
    ]);
    console.log('stop res: ', result);
    if (event && !result.code) {
      setAppStatus({ ...appStatus, isRunning: false });
    }
    if (config.postmanEnabled) {
      const postmanRes = await ddClient.docker.cli.exec('stop', [
        POSTMAN_CONTAINER
      ]);
      console.log('postman res: ', postmanRes)
      if (event && !postmanRes.code) {
        setPostmanStatus({ ...postmanStatus, isRunning: false });
      }
    }
    if (config.asyncEnabled) {
      const asyncRes = await ddClient.docker.cli.exec('stop', [
        KAFKA_CONTAINER,
        ASYNC_MINION_CONTAINER,
      ]);
      console.log('async res: ', asyncRes)
      if (event && !asyncRes.code) {
        setKafkaStatus({ ...kafkaStatus, isRunning: false });
        setAsyncMinionStatus({ ...asyncMinionStatus, isRunning: false });
      }
    }
    return result;
  };

  const deleteMicrocksDialog = async (
    event?: React.MouseEvent<HTMLSpanElement>,
  ) => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = (event: any, response: string) => {
    console.log('dialog response: ', response);
    setOpenDeleteDialog(false);
    if (response == 'delete') {
      deleteMicrocks(event);
    }
  };

  const deleteMicrocks = async (event?: React.MouseEvent<HTMLSpanElement>) => {
    console.log('Deleting Microcks');
    if (appStatus.isRunning) {
      const result = await stopMicrocks();
    }
    setIsLoading(true);
    if (event) {
      ddClient.desktopUI.toast.success('Deleting Microcks...');
    }
    try {
      const result = await ddClient.docker.cli.exec('rm', [
        '--force',
        '-v',
        APP_CONTAINER,
      ]);
      console.log('result delete', result);
      if (!result.code) {
        setAppStatus({ ...appStatus, exists: false, isRunning: false });
      }
    } catch (error: any) {
      console.error(error.stderr);
    }
    if (config.postmanEnabled) {
      const postmanRes = await ddClient.docker.cli.exec('rm', [
        '--force',
        '-v',
        POSTMAN_CONTAINER,
      ]);
      if (!postmanRes.code) {
        setPostmanStatus({ ...postmanStatus, exists: false, isRunning: false });
      }
    }
    if (config.asyncEnabled) {
      const asyncRes = await ddClient.docker.cli.exec('rm', [
        '-v',
        KAFKA_CONTAINER,
        ASYNC_MINION_CONTAINER,
      ]);
      if (!asyncRes.code) {
        setKafkaStatus({ ...kafkaStatus, exists: false, isRunning: false });
        setAsyncMinionStatus({
          ...asyncMinionStatus,
          exists: false,
          isRunning: false,
        });
      }
    }
    // TODO Delete local data
  };

  const buildStreamingOpts = (
    container: string,
    status: React.Dispatch<React.SetStateAction<ContainerStatus>>,
  ): ExecStreamOptions => {
    return {
      onOutput(data: any) {
        if (data.stdout) {
          console.log('[%s] ' + data.stdout, container);
        } else {
          console.error('[%s] ' + data.stderr, container);
        }
      },
      onError(error: any) {
        console.error('[%s] Error:' + error, container);
        setIsLoading(false);
      },
      onClose(exitCode: any) {
        console.log('[%s] ' + 'onClose with exit code ' + exitCode, container);
        if (!exitCode) {
          status((prevStatus) => ({
            ...prevStatus,
            isRunning: true,
            exists: true,
          }));
        }
        else if (container === APP_CONTAINER) {
          console.error("Main app crashed!")
          if (exitCode == 125) {
            console.error('Failed: port is already allocated.');
            handleLaunchFailure();
          }
        }
      },
      splitOutputLines: true,
    };
  };

  const handleLaunchFailure = async () => {
    try {
      const result = await deleteMicrocks();
    } catch (error: any) {
      console.error(error.stderr);
    }
    setAlertDialogData((value) => ({
      ...value,
      title: 'Failure',
      text: 'Port is already allocated. Please use a different port by changing the port offset in the settings dialog.',
    }));
    setOpenAlertDialog(true);
  };

  const checkHealth = async () => {
    try {
      if (!isReady) {
        console.log('checking health');
        const res = await fetch(
          `http://localhost:${8080 + config.portOffset || 8080}/api/health`,
        );
        console.log('health status: ', res.status);
        if (res.status == 200) {
          /* Clean up interval */
          setIsReady(true);
          /* Enable UI */
          setIsLoading(false);
        }
      }
    } catch (e) {
      if (typeof e === 'string') {
        console.warn(e.toUpperCase());
      } else if (e instanceof Error) {
        console.warn(e.message);
      } else {
        console.error(e);
      }
    }
  };

  const handleOpenSettings = () => {
    console.log('Opening settings dialog.');
    setIsSettingsDialog(true);
  };

  const handleCloseSettingsDialog = async (
    config: ExtensionConfig | undefined | null,
  ) => {
    setIsSettingsDialog(!isSettingsDialog);

    console.log('handleClose() config', config);

    if (config) {
      setIsLoading(true);
      writePropertiesFiles(config);
      writeExtensionConfig(config);

      console.log('handleClose() appstatus', appStatus);

      if (appStatus.exists) {
        // Containers should always be removed.
        const resDel = await deleteMicrocks();
      }

      setConfig(config);
      if (appStatus.isRunning) {
        setLaunched(true);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleCloseAlertDialog = () => {
    setOpenAlertDialog(false);
    setAlertDialogData({ text: '', title: '' });
    setIsLoading(false);
    setIsSettingsDialog(true);
  };

  return (
    <Container>
      {status === 'INITIALIZING' ? (
        <Stack
          sx={{
            display: 'flex',
            flexGrow: 1,
            height: '90vh',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          spacing={5}
        >
          <CircularProgress color="primary" />
        </Stack>
      ) : status == 'NOT_RUNNING' ? (
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
                onClick={handleOpenSettings}
              >
                Settings
              </Button>
              <Button variant="contained" size="large" onClick={launchMicrocks}>
                Launch Microcks
              </Button>
            </Stack>
          </Stack>
          <Footer>
            {appStatus.exists && (
              <Link onClick={deleteMicrocksDialog} component="button">
                Delete Microcks
              </Link>
            )}
          </Footer>
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          height="95vh"
        >
          <Box
            sx={{ display: 'flex', width: '100%', alignItems: 'center' }}
            my={1}
          >
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
                <IconButton onClick={handleOpenSettings}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box m={2}>
              <Button variant="contained" color="error" onClick={stopMicrocks}>
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
            <Box
              alignContent="center"
              display="flex"
              alignItems="center"
              mx={1}
            >
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
                  onClick={() =>
                    ddClient.host.openExternal(
                      `http://localhost:${8080 + config.portOffset}/#/`,
                    )
                  }
                  variant="subtitle1"
                  component="span"
                >
                  http://localhost:{8080 + config.portOffset}
                </Link>
                <IconButton
                  onClick={() =>
                    ddClient.host.openExternal(
                      `http://localhost:${8080 + config.portOffset}/#/`,
                    )
                  }
                  component="span"
                  size="small"
                >
                  <OpenInNewIcon
                    fontSize="small"
                  />
                </IconButton>
                <ClipboardCopy
                  copyText={`http://localhost:${8080 + config.portOffset}/#/`}
                  size="small"
                />
              </Typography>
            </Box>
          </Paper>
          <Services config={config} />
          <Footer>
            {appStatus.exists && (
              <Link onClick={deleteMicrocksDialog} component="button">
                Delete Microcks
              </Link>
            )}
          </Footer>
        </Box>
      )}
      <SettingsDialog
        config={config}
        isRunning={appStatus.isRunning}
        isDialogOpen={isSettingsDialog}
        closeHandler={handleCloseSettingsDialog}
      />
      <DeleteDialog
        open={openDeleteDialog}
        closeHandler={handleCloseDeleteDialog}
      />
      <AlertDialog
        title={alertDialogData.title}
        text={alertDialogData.text}
        open={openAlertDialog}
        closeHandler={handleCloseAlertDialog}
      />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default App;
