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
import React, { useEffect, useState } from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';

import Backdrop from '@mui/material/Backdrop';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {
  initializeFileSystem,
  getExtensionConfig,
  getHome,
  writePropertiesFiles,
  writeExtensionConfig,
} from './api/config';
import { ExtensionConfig } from './types/ExtensionConfig';
import { ContainerStatus } from './types/ContainerStatus';
import { getContainerInfo } from './api/containers';
import { sendMetric } from './api/metrics';
import { ensureNetworkExists } from './api/network';
import { EXTENSION_NETWORK } from './utils/constants';
import Settings from './components/Settings';
import Footer from './components/Footer';
import './App.css';

// const ddClient = createDockerDesktopClient();
const client = createDockerDesktopClient();

const useDockerDesktopClient = () => {
  return client;
};

const isWindows = () => {
  let windowsSystem = navigator.platform.startsWith('Win');
  return windowsSystem;
};

type Service = {
  id: string;
  name: string;
  version: string;
  type: string;
};

const App = () => {
  const ddClient = useDockerDesktopClient();

  const [uiMode, setUIMode] = useState({} as string);

  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsDialog, setIsSettingsDialog] = useState(false);

  const [appStatus, setAppStatus] = useState({} as ContainerStatus);
  const [postmanStatus, setPostmanStatus] = useState({} as ContainerStatus);
  const [mongoStatus, setMongoStatus] = useState({} as ContainerStatus);
  const [kafkaStatus, setKafkaStatus] = useState({} as ContainerStatus);
  const [asyncMinionStatus, setAsyncMinionStatus] = useState({} as ContainerStatus);

  const [initialized, setInitialized] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const [appDir, setAppDir] = useState('');
  const [config, setConfig] = useState<ExtensionConfig>({} as ExtensionConfig);

  const APP_CONTAINER: string = 'microcks';
  const POSTMAN_CONTAINER: string = 'microcks-postman';
  const MONGO_CONTAINER: string = 'microcks-mongodb';
  const KAFKA_CONTAINER: string = 'microcks-kafka';
  const ASYNC_MINION_CONTAINER: string = 'microcks-async-minion';

  useEffect(() => {
    const isSystemInDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    console.log('isSystemInDarkMode? ' + isSystemInDarkMode);
    setUIMode(isSystemInDarkMode ? "dark" : "light");
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      const colorScheme = event.matches ? "dark" : "light";
      console.log('colorScheme change: ' + colorScheme);
      setUIMode(colorScheme);
    });
  }, []);

  useEffect(() => {
    console.log('Loading Microcks Extension for Docker Desktop.');

    initializeFileSystem().then((result) => {
      if (result) {
        initializeExtension();
        sendMetric("microcks_extension_opened", {});
      }
      // TODO: managed this low level error that prevent extension initialization.
    });
  }, []);

  useEffect(() => {
    setInitialized(appStatus.isRunning);
    if (appStatus.isRunning && isLoading) {
      ddClient.desktopUI.toast.success('Microcks is running');
    }
    setIsLoading(false);
  }, [appStatus]);

  const initializeExtension = () => {
    getHome().then((result) => {
      console.log('Home path: ' + result);
      if (result != null) {
        result = result.replace(/\n/g, '').replace(/\r/g, '');
        const dir = result + (isWindows() ? '\\' : '/') + '.microcks-docker-desktop-extension';
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
    getContainerInfo(MONGO_CONTAINER).then((info) => setMongoStatus(info));
    getContainerInfo(KAFKA_CONTAINER).then((info) => setKafkaStatus(info));
    getContainerInfo(ASYNC_MINION_CONTAINER).then((info) => setAsyncMinionStatus(info));
  };

  const launchMicrocks = async () => {
    console.log('Launch Microcks!');
    sendMetric("microcks_extension_launched", {'config': config});

    setIsLoading(true);

    /*
    // Simple docker run command from docker-decompose ;-)
    docker run -d --name "mongo" -v "~/tmp/microcks-data:/data/db" "mongo:3.4.23"
    docker run -d --name "postman" "quay.io/microcks/microcks-postman-runtime:latest"
    docker run -d --name "kafka" -p "9092:9092" -p "19092:19092" "vectorized/redpanda:v21.10.2" "redpanda start --overprovisioned --smp 1  --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092"
    docker run -d --name "app" -e "SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *" -e "SPRING_PROFILES_ACTIVE=prod" -e "KEYCLOAK_ENABLED=false" -e "KAFKA_BOOTSTRAP_SERVER=kafka:19092" -e "SPRING_DATA_MONGODB_URI=mongodb://mongo:27017" -e "TEST_CALLBACK_URL=http://microcks:8080" -e "SPRING_DATA_MONGODB_DATABASE=microcks" -e "ASYNC_MINION_URL=http://microcks-async-minion:8081" -e "POSTMAN_RUNNER_URL=http://postman:3000" -p "8080:8080" -p "9090:9090" -v "./config:/deployments/config" "quay.io/microcks/microcks:latest"
    docker run -d --name "async-minion" -e "QUARKUS_PROFILE=docker-compose" -p "8081:8081" --restart "on-failure" -v "./config:/deployments/config" "quay.io/microcks/microcks-async-minion:latest"
    */

    ensureNetworkExists().then(async (exists) => {
      console.log('network result', exists);
      if (exists) {
        const volumeDir = isWindows()
          ? `//${appDir.replace(/\\/g, '/').replace('C:', 'c')}`
          : appDir;
        
        console.log('mongostatus', mongoStatus);
        if (mongoStatus && !mongoStatus.isRunning) {
          const mStatus = { ...mongoStatus };
          if (!mongoStatus.exists) {
            console.log('Creating ', MONGO_CONTAINER);
            const mongoRes = ddClient.docker.cli.exec(
              'run',
              [
                '-d',
                '--name', MONGO_CONTAINER,
                '--network', EXTENSION_NETWORK,
                '--hostname', 'mongo',
                '-v', volumeDir + '/data:/data/db',
                'mongo:3.4.23',
              ],
              { stream: buildStreamingOpts(MONGO_CONTAINER) },
            );
            mStatus.exists = true;
          } else {
            startContainer(MONGO_CONTAINER);
          }
          mStatus.isRunning = true;
          setMongoStatus(mStatus);
        }

        console.log('postmanstatus', postmanStatus);
        if (postmanStatus && !postmanStatus.isRunning) {
          const pStatus = { ...postmanStatus };
          if (!postmanStatus.exists) {
            console.log('Creating ', POSTMAN_CONTAINER);
            const postmanRes = ddClient.docker.cli.exec(
              'run',
              [
                '-d',
                '--name', POSTMAN_CONTAINER,
                '--network', EXTENSION_NETWORK,
                '--hostname', 'postman',
                'quay.io/microcks/microcks-postman-runtime:latest',
              ],
              { stream: buildStreamingOpts(POSTMAN_CONTAINER) },
            );
            pStatus.exists = true;
          } else {
            startContainer(POSTMAN_CONTAINER);
          }
          pStatus.isRunning = true;
          setPostmanStatus(pStatus);
        }

        console.log('appstatus', appStatus);
        if (appStatus && !appStatus.isRunning) {
          const aStatus = { ...appStatus };
          const params = [
            '-d',
            '--name', APP_CONTAINER,
            '--network', EXTENSION_NETWORK,
            '--hostname', 'app',
            '-v', volumeDir + '/config:/deployments/config',
            '-e', 'SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *',
            '-e', 'SPRING_PROFILES_ACTIVE=prod',
            '-e', 'KEYCLOAK_ENABLED=false',
            '-e', 'KAFKA_BOOTSTRAP_SERVER=kafka:19092',
            '-e', 'SPRING_DATA_MONGODB_URI=mongodb://mongo:27017',
            '-e', 'SPRING_DATA_MONGODB_DATABASE=microcks',
            '-e', 'TEST_CALLBACK_URL=http://microcks:8080',
            '-e', 'ASYNC_MINION_URL=http://microcks-async-minion:8081',
            '-e', 'POSTMAN_RUNNER_URL=http://postman:3000',
            '-p', `${8080 + config.portOffset}:8080`,
            '-p', `${9090 + config.portOffset}:9090`,
            'quay.io/microcks/microcks:latest',
          ];
          if (!appStatus.exists) {
            console.log('Creating ', APP_CONTAINER);
            const result = await runContainer(APP_CONTAINER, params);
            aStatus.exists = true;
          } else {
            if (appStatus.mappedPort != 8080 + config.portOffset) {
              const removeRes = await removeContainer(APP_CONTAINER);
              const runRes = await runContainer(APP_CONTAINER, params);
            } else {
              startContainer(APP_CONTAINER);
            }
          }
          aStatus.isRunning = true;
          setAppStatus(aStatus);
        }

        if (config.asyncEnabled) {
          console.log('Async configuration is enabled, launching async related containers...');
          if (kafkaStatus && !kafkaStatus.isRunning) {
            const kStatus = { ...kafkaStatus };
            const params = [
              '-d',
              '--name', KAFKA_CONTAINER,
              '--network', EXTENSION_NETWORK,
              '--hostname', 'kafka',
              '-p', `${9092 + config.portOffset}:${9092 + config.portOffset}`,
              '-p', '19092:19092',
              'vectorized/redpanda:v21.10.2',
              `redpanda start --overprovisioned --smp 1 --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:${9092 + config.portOffset} --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:${9092 + config.portOffset}`,
            ];
            if (!kafkaStatus.exists) {
              console.log('Creating ', KAFKA_CONTAINER);
              const result = await runContainer(KAFKA_CONTAINER, params);
              kStatus.exists = true;
            } else {
              if (kafkaStatus.mappedPort != 9092 + config.portOffset) {
                const removeRes = await removeContainer(KAFKA_CONTAINER);
                const runRes = await runContainer(KAFKA_CONTAINER, params);
              } else {
                startContainer(KAFKA_CONTAINER);
              }
            }
            kStatus.isRunning = true;
            setKafkaStatus(kStatus);
          }

          if (asyncMinionStatus && !asyncMinionStatus.isRunning) {
            if (!asyncMinionStatus.exists) {
              console.log('Creating ', ASYNC_MINION_CONTAINER);
              const minionRes = ddClient.docker.cli.exec(
                'run',
                [
                  '-d',
                  '--name', ASYNC_MINION_CONTAINER,
                  '--network', EXTENSION_NETWORK,
                  '--hostname', 'microcks-async-minion',
                  '-v', volumeDir + '/config:/deployments/config',
                  '-e', 'QUARKUS_PROFILE=docker-compose',
                  '--restart', 'on-failure',
                  '-p', `${8081 + config.portOffset}:8081`,
                  'quay.io/microcks/microcks-async-minion:latest',
                ],
                { stream: buildStreamingOpts(ASYNC_MINION_CONTAINER) },
              );
              asyncMinionStatus.exists = true;
            } else {
              const minionRes = ddClient.docker.cli.exec('start', [
                ASYNC_MINION_CONTAINER,
              ]);
            }
            asyncMinionStatus.isRunning = true;
          }
        }
      } else {
        // TODO: Manage this low-level error.
        console.error('Error while ensuring extension network exists');
      }
    });
  };

  const runContainer = async (container: string, params: string[]) => {
    const appRes = ddClient.docker.cli.exec('run', params, {
      stream: buildStreamingOpts(container),
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
        case MONGO_CONTAINER:
          setMongoStatus({ ...mongoStatus, exists: false });
          break;
        case POSTMAN_CONTAINER:
          setPostmanStatus({ ...postmanStatus, exists: false });
          break;
        case KAFKA_CONTAINER:
          setKafkaStatus({ ...kafkaStatus, exists: false });
          break;
        case ASYNC_MINION_CONTAINER:
          setAsyncMinionStatus({ ...asyncMinionStatus, exists: false});
          break;

        default:
          break;
      }
    }
    return result;
  };

  const startContainer = async (container: string) => {
    console.log('Starting ', container);
    const result = await ddClient.docker.cli.exec('start', [container]);
    if (!result.code) {
      switch (container) {
        case APP_CONTAINER:
          setAppStatus({ ...appStatus, isRunning: true });
          break;
        case MONGO_CONTAINER:
          setMongoStatus({ ...mongoStatus, isRunning: true });
          break;
        case POSTMAN_CONTAINER:
          setPostmanStatus({ ...postmanStatus, isRunning: true });
          break;
        case KAFKA_CONTAINER:
          setKafkaStatus({ ...kafkaStatus, isRunning: true });
          break;
        case ASYNC_MINION_CONTAINER:
          setAsyncMinionStatus({ ...asyncMinionStatus, isRunning: true});
          break;

        default:
          break;
      }
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
        case MONGO_CONTAINER:
          setMongoStatus({ ...mongoStatus, isRunning: false });
          break;
        case POSTMAN_CONTAINER:
          setPostmanStatus({ ...postmanStatus, isRunning: false });
          break;
        case KAFKA_CONTAINER:
          setKafkaStatus({ ...kafkaStatus, isRunning: false });
          break;
        case ASYNC_MINION_CONTAINER:
          setAsyncMinionStatus({ ...asyncMinionStatus, isRunning: false});
          break;

        default:
          break;
      }
    }
    return result;
  };

  const stopMicrocks = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Stopping Microcks...');
    sendMetric("microcks_extension_stopped", {'config': config});
    
    setIsLoading(true);
    if (event) {
      ddClient.desktopUI.toast.success('Stopping Microcks...');
    }
    const result = await ddClient.docker.cli.exec('stop', [
      MONGO_CONTAINER,
      POSTMAN_CONTAINER,
      APP_CONTAINER
    ]);
    if (!result.code) {
      setAppStatus({ ...appStatus, isRunning: false });
      setPostmanStatus({ ...postmanStatus, isRunning: false });
      setMongoStatus({ ...mongoStatus, isRunning: false });
    }
    if (config.asyncEnabled) {
      const asyncRes =   await ddClient.docker.cli.exec('stop', [
        KAFKA_CONTAINER, ASYNC_MINION_CONTAINER
      ]);
      if (!asyncRes.code) {
        setKafkaStatus({ ...kafkaStatus, isRunning: false});
        setAsyncMinionStatus({ ...asyncMinionStatus, isRunning: false});
      }
    }
    return result;
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
    const result = await ddClient.docker.cli.exec('rm', [
      '-v',
      MONGO_CONTAINER,
      POSTMAN_CONTAINER,
      APP_CONTAINER
    ]);
    console.log('result delete', result);
    if (!result.code) {
      setAppStatus({ ...appStatus, exists: false, isRunning: false });
      setPostmanStatus({ ...postmanStatus, exists: false, isRunning: false });
      setMongoStatus({ ...mongoStatus, exists: false, isRunning: false });
    }
    if (config.asyncEnabled) {
      const asyncRes =   await ddClient.docker.cli.exec('rm', [
        '-v', KAFKA_CONTAINER, ASYNC_MINION_CONTAINER
      ]);
      if (!asyncRes.code) {
        setKafkaStatus({ ...kafkaStatus, exists: false, isRunning: false});
        setAsyncMinionStatus({ ...asyncMinionStatus, exists: false, isRunning: false});
      }
    }
  };

  const buildStreamingOpts = (container: string): any => {
    return {
      onOutput(data: any) {
        if (data.stdout) {
          console.error('[%s] ' + data.stdout, container);
        } else {
          console.log('[%s] ' + data.stderr, container);
        }
      },
      onError(error: any) {
        console.error('[%s] ' + error, container);
      },
      onClose(exitCode: any) {
        console.log('[%s] ' + 'onClose with exit code ' + exitCode, container);
      },
      splitOutputLines: true,
    };
  };

  const handleOpenSettings = () => {
    console.log('Opening settings dialog.');
    setIsSettingsDialog(true);
  };

  const handleCloseSettings = async (
    config: ExtensionConfig | undefined | null,
  ) => {
    setIsSettingsDialog(!isSettingsDialog);

    if (config) {
      setIsLoading(true);
      writePropertiesFiles(config);
      writeExtensionConfig(config);
      setConfig(config);

      console.log('appstatus', appStatus);

      if (appStatus.exists) {
        if (appStatus.isRunning) {
          const resStop = await stopMicrocks();
        }
        // Containers should always be removed.
        const resDel = await deleteMicrocks();
      }
      setIsLoading(false);
    }
  };

  return (
    <Container>
      {!initialized ? (
        <Stack
          sx={{
            display: 'flex',
            flexGrow: 1,
            height: '100vh',
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
            src={ uiMode === 'light' ? 'assets/images/microcks-logo-blue-baseline-tweet.png':'assets/images/microcks-logo-white-baseline-tweet.png' }
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
      ) : (
        <Box
          sx={{ display: 'flex', width: '100%', alignItems: 'center' }}
          my={1}
        >
          <Box alignContent="flex-start" textAlign="left" flexGrow={1}>
            <Typography sx={{ fontWeight: 'bolder' }} variant="h5">
              Microcks for Docker Desktop
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
      )}
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
        {appStatus.isRunning && (
          <Chip variant="filled" color="success" label="RUNNING" />
        )}
        <Box alignContent="center" display="flex" alignItems="center" mx={1}>
          <DoneOutlinedIcon />
        </Box>
        <Box
          flexGrow={1}
          alignContent="center"
          display="flex"
          alignItems="center"
        >
          <Typography variant="subtitle1">
            Microcks is running. To access the UI navigate to:{' '}
            <Link
              onClick={() =>
                ddClient.host.openExternal(
                  `http://localhost:${8080 + config.portOffset}`,
                )
              }
              variant="subtitle1"
              component="button"
            >
              http://localhost:{8080 + config.portOffset}
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* <Box my={2}>
        <Typography variant="h3">APIs &amp; Services</Typography>
        {services.map((service) => (
          <Stack>
            <Typography>
            <span>Id: </span>
            {service.id}
            </Typography>
            <Typography>{service.name}</Typography>
            <Typography>{service.type}</Typography>
            <Typography>{service.version}</Typography>
            </Stack>
            ))}
          </Box> */}
      <Footer>
        {appStatus.exists && (
          <Link onClick={deleteMicrocks} component="button">
            Delete Microcks
          </Link>
        )}
      </Footer>
      <Settings
        config={config}
        isRunning={appStatus.isRunning}
        isDialogOpen={isSettingsDialog}
        handleCloseDialog={handleCloseSettings}
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
