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
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SettingsIcon from '@mui/icons-material/Settings';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import {
  initializeFileSystem,
  getExtensionConfig,
  getHome,
  writePropertiesFiles,
} from './api/config';
import { ExtensionConfig } from './types/ExtensionConfig';
import { ContainerStatus } from './types/ContainerStatus';
import { getContainerInfo } from './api/containers';
import { ensureNetworkExists } from './api/network';
import { EXTENSION_NETWORK } from './utils/constants';
import Settings from './components/Settings';
import Footer from './components/Footer';
import './App.css';
import { Extension } from '@docker/extension-api-client-types/dist/v1';

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

  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsDialog, setIsSettingsDialog] = useState(false);

  const [appStatus, setAppStatus] = useState({} as ContainerStatus);
  const [postmanStatus, setPostmanStatus] = useState({} as ContainerStatus);
  const [mongoStatus, setMongoStatus] = useState({} as ContainerStatus);
  const [kafkaStatus, setKafkaStatus] = useState({} as ContainerStatus);
  const [asyncMinionStatus, setAsyncMinionStatus] = useState(
    {} as ContainerStatus,
  );

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
    console.log('Loading Microcks Extension for Docker Desktop.');

    initializeFileSystem().then((result) => {
      if (result) {
        initializeExtension();
      }
      // TODO: managed this low level error that prevent extension initialization.
    });
  }, []);

  useEffect(() => {
    console.log(appStatus);
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
        const dir =
          result +
          (isWindows() ? '\\' : '/') +
          '.microcks-docker-desktop-extension';
        console.log('Extension dir: ' + dir);
        setAppDir(dir);
      }
      // const svcs = result?.parseJsonObject() as Service[];
      const svcs = result;
      console.log(svcs);
      // setServices(svcs);
    });

    getExtensionConfig().then((result) => {
      const conf = result;
      console.log('Config:', conf);
      setConfig(conf);
      writePropertiesFiles(config);
    });

    getContainerInfo(APP_CONTAINER).then((info) => setAppStatus(info));
    getContainerInfo(POSTMAN_CONTAINER).then((info) => setPostmanStatus(info));
    getContainerInfo(MONGO_CONTAINER).then((info) => setMongoStatus(info));
    getContainerInfo(KAFKA_CONTAINER).then((info) => setKafkaStatus(info));
    getContainerInfo(ASYNC_MINION_CONTAINER).then((info) =>
      setAsyncMinionStatus(info),
    );
  };

  const launchMicrocks = () => {
    console.log('Launch Microcks!');

    setIsLoading(true);

    /*
    // Simple docker run command from docker-decompose ;-)
    docker run -d --name "mongo" -v "~/tmp/microcks-data:/data/db" "mongo:3.4.23"
    docker run -d --name "postman" "quay.io/microcks/microcks-postman-runtime:latest"
    docker run -d --name "kafka" -p "9092:9092" -p "19092:19092" "vectorized/redpanda:v21.10.2" "redpanda start --overprovisioned --smp 1  --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092"
    docker run -d --name "app" -e "SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *" -e "SPRING_PROFILES_ACTIVE=prod" -e "KEYCLOAK_ENABLED=false" -e "KAFKA_BOOTSTRAP_SERVER=kafka:19092" -e "SPRING_DATA_MONGODB_URI=mongodb://mongo:27017" -e "TEST_CALLBACK_URL=http://microcks:8080" -e "SPRING_DATA_MONGODB_DATABASE=microcks" -e "ASYNC_MINION_URL=http://microcks-async-minion:8081" -e "POSTMAN_RUNNER_URL=http://postman:3000" -p "8080:8080" -p "9090:9090" -v "./config:/deployments/config" "quay.io/microcks/microcks:latest"
    docker run -d --name "async-minion" -e "QUARKUS_PROFILE=docker-compose" -p "8081:8081" --restart "on-failure" -v "./config:/deployments/config" "quay.io/microcks/microcks-async-minion:latest"
    */

    ensureNetworkExists().then((exists) => {
      if (exists) {
        const volumeDir = isWindows()
          ? `//${appDir.replace(/\\/g, '/').replace('C:', 'c')}`
          : appDir;
        console.log('vol', volumeDir);
        if (mongoStatus && !mongoStatus.isRunning) {
          const mStatus = { ...mongoStatus };
          if (!mongoStatus.exists) {
            console.log('Creating ', MONGO_CONTAINER);
            const mongoRes = ddClient.docker.cli.exec(
              'run',
              [
                '-d',
                '--name',
                MONGO_CONTAINER,
                '--network',
                EXTENSION_NETWORK,
                '--hostname',
                'mongo',
                '-v',
                volumeDir + '/data:/data/db',
                'mongo:3.4.23',
              ],
              { stream: buildStreamingOpts(MONGO_CONTAINER) },
            );
            mStatus.exists = true;
          } else {
            console.log('Starting ', MONGO_CONTAINER);
            const mongoRes = ddClient.docker.cli.exec('start', [
              MONGO_CONTAINER,
            ]);
          }
          mStatus.isRunning = true;
          setMongoStatus(mStatus);
        }

        if (postmanStatus && !postmanStatus.isRunning) {
          const pStatus = { ...postmanStatus };
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
                'postman',
                'quay.io/microcks/microcks-postman-runtime:latest',
              ],
              { stream: buildStreamingOpts(POSTMAN_CONTAINER) },
            );
            pStatus.exists = true;
          } else {
            console.log('Starting ', POSTMAN_CONTAINER);
            const postmanRes = ddClient.docker.cli.exec('start', [
              POSTMAN_CONTAINER,
            ]);
          }
          pStatus.isRunning = true;
          setPostmanStatus(pStatus);
        }

        if (appStatus && !appStatus.isRunning) {
          const aStatus = { ...appStatus };
          if (!appStatus.exists) {
            console.log('Extension dir: ' + appDir);
            console.log('Creating ', APP_CONTAINER);
            const appRes = ddClient.docker.cli.exec(
              'run',
              [
                '-d',
                '--name',
                APP_CONTAINER,
                '--network',
                EXTENSION_NETWORK,
                '--hostname',
                'app',
                '-v',
                volumeDir + '/config:/deployments/config',
                '-e',
                'SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *',
                '-e',
                'SPRING_PROFILES_ACTIVE=prod',
                '-e',
                'KEYCLOAK_ENABLED=false',
                '-e',
                'KAFKA_BOOTSTRAP_SERVER=kafka:19092',
                '-e',
                'SPRING_DATA_MONGODB_URI=mongodb://mongo:27017',
                '-e',
                'SPRING_DATA_MONGODB_DATABASE=microcks',
                '-e',
                'TEST_CALLBACK_URL=http://microcks:8080',
                '-e',
                'ASYNC_MINION_URL=http://microcks-async-minion:8081',
                '-e',
                'POSTMAN_RUNNER_URL=http://postman:3000',
                '-p',
                '8080:8080',
                '-p',
                '9090:9090',
                'quay.io/microcks/microcks:latest',
              ],
              { stream: buildStreamingOpts(APP_CONTAINER) },
            );
            aStatus.exists = true;
            aStatus.isRunning = true;
            setAppStatus(aStatus);
          } else {
            startContainer(APP_CONTAINER);
          }
        }

        if (config.asyncEnabled) {
          console.info(
            'Async configuration is enabled, launching async related containers...',
          );
          if (kafkaStatus && !kafkaStatus.isRunning) {
            if (!kafkaStatus.exists) {
              const kafkaRes = ddClient.docker.cli.exec(
                'run',
                [
                  '-d',
                  '--name',
                  KAFKA_CONTAINER,
                  '--network',
                  EXTENSION_NETWORK,
                  '--hostname',
                  'kafka',
                  '-p',
                  '9092:9092',
                  '-p',
                  '19092:19092',
                  'vectorized/redpanda:v21.10.2',
                  'redpanda start --overprovisioned --smp 1 --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092',
                ],
                { stream: buildStreamingOpts(KAFKA_CONTAINER) },
              );
              kafkaStatus.exists = true;
            } else {
              const kafkaRes = ddClient.docker.cli.exec('start', [
                KAFKA_CONTAINER,
              ]);
            }
            kafkaStatus.isRunning = true;
          }

          if (asyncMinionStatus && !asyncMinionStatus.isRunning) {
            if (!asyncMinionStatus.exists) {
              const minionRes = ddClient.docker.cli.exec(
                'run',
                [
                  '-d',
                  '--name',
                  ASYNC_MINION_CONTAINER,
                  '--network',
                  EXTENSION_NETWORK,
                  '--hostname',
                  'microcks-async-minion',
                  '-e',
                  'QUARKUS_PROFILE=docker-compose',
                  '--restart',
                  'on-failure',
                  '-p',
                  '8081:8081',
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

    const startContainer = async (container: string) => {
      console.log('Starting ', container);
      const result = await ddClient.docker.cli.exec('start', [container]);
      if (!result.code) {
        switch (container) {
          case APP_CONTAINER:
            setAppStatus({ ...appStatus, isRunning: true });
            break;

          default:
            break;
        }
      }
    };

    /*
    const kafkaRes = await ddClient.docker.cli.exec("run", [
      "-d", "--name", "kafka",
      "-p", "9092:9092", "-p", "19092:19092",
      "vectorized/redpanda:v21.10.2",
      "redpanda start --overprovisioned --smp 1 --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092"],
      { stream: buildStreamingOpts("kafka") }
    );
    const appRes = await ddClient.docker.cli.exec("run", [
      "-d", "--name", "app",
      "-e", "SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *",
      "-e", "SPRING_PROFILES_ACTIVE=prod",
      "-e", "KEYCLOAK_ENABLED=false",
      "-e", "KAFKA_BOOTSTRAP_SERVER=kafka:19092",
      "-e", "SPRING_DATA_MONGODB_URI=mongodb://mongo:27017",
      "-e", "SPRING_DATA_MONGODB_DATABASE=microcks",
      "-e", "TEST_CALLBACK_URL=http://microcks:8080",
      "-e", "ASYNC_MINION_URL=http://microcks-async-minion:8081",
      "-e", "POSTMAN_RUNNER_URL=http://postman:3000",
      "-p", "8080:8080", "-p", "9090:9090",
      "quay.io/microcks/microcks:latest"],
      { stream: buildStreamingOpts("app") }
    );
    const minionRes = await ddClient.docker.cli.exec("run", [
      "-d", "--name", "async-minion",
      "-e", "QUARKUS_PROFILE=docker-compose",
      "--restart", "on-failure",
      "-p", "8081:8081",
      "quay.io/microcks/microcks-async-minion:latest"],
      { stream: buildStreamingOpts("async-minion") }
    );
    */
  };

  const stopMicrocks = async () => {
    console.log('Stopping Microcks');
    setIsLoading(true);
    ddClient.desktopUI.toast.success('Stopping Microcks...');
    const result = await ddClient.docker.cli.exec('stop', [
      MONGO_CONTAINER,
      POSTMAN_CONTAINER,
      APP_CONTAINER,
    ]);
    if (!result.code) {
      setAppStatus({ ...appStatus, isRunning: false });
      setPostmanStatus({ ...postmanStatus, isRunning: false });
      setMongoStatus({ ...mongoStatus, isRunning: false });
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
            m={2}
            sx={{
              width: 450,
              maxWidth: { xs: 450, md: 350 },
            }}
            component="img"
            src="assets/images/microcks-logo-blue-baseline.png"
            alt="Microcks Logo"
          />
          <Paper
            elevation={2}
            sx={{
              backgroundColor: '#dadada',
              margin: 2,
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
              <Typography>
                Microcks is not running. First launch can take some time while
                we're pullig the container images.
              </Typography>
            </Box>
            <Box
              flexGrow={1}
              alignContent="center"
              display="flex"
              alignItems="center"
            ></Box>
          </Paper>
          <Box m={2}>
            <Button variant="contained" size="large" onClick={launchMicrocks}>
              Launch Microcks
            </Button>
          </Box>
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
            <Typography variant="subtitle1">
              API Mocking and Testing for REST, GraphQL and AsyncAPI
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handleOpenSettings}>
              <SettingsIcon />
            </IconButton>
          </Box>
          <Box m={2}>
            <Button variant="contained" color="error" onClick={stopMicrocks}>
              Stop Microcks
            </Button>
          </Box>
        </Box>
      )}
      <Paper
        elevation={2}
        sx={{
          backgroundColor: '#dadada',
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

      <Footer />
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
      <Settings
        config={config}
        isDialogOpen={isSettingsDialog}
        handleCloseDialog={(config: ExtensionConfig | undefined | null) => {
          setIsSettingsDialog(!isSettingsDialog);
          if (config) {
            setConfig(config);
          }
        }}
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
