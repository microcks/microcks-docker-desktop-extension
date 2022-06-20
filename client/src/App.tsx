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
import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from '@mui/material';
import { createDockerDesktopClient } from '@docker/extension-api-client';

import { getExtensionConfig, getHome, writePropertiesFiles } from "./api/config";
import { ExtensionConfig } from "./types/ExtensionConfig";
import { ContainerStatus } from "./types/ContainerStatus";
import { getContainerInfo } from "./api/containers";
import { ensureNetworkExists } from "./api/network";
import { EXTENSION_NETWORK } from "./utils/constants";

const ddClient = createDockerDesktopClient();

export function App() {
  let APP_CONTAINER: string = 'microcks-app';
  let POSTMAN_CONTAINER: string = 'microcks-postman';
  let MONGO_CONTAINER: string  = 'mincrocks-mongodb'
  let KAFKA_CONTAINER: string = 'microcks-kafka';
  let ASYNC_MINION_CONTAINER: string = 'microcks-async-minion';

  let appDir: string;
  let config: ExtensionConfig

  let appStatus: ContainerStatus
  let postmanStatus: ContainerStatus
  let mongoStatus: ContainerStatus
  let kafkaStatus: ContainerStatus
  let asyncMinionStatus: ContainerStatus
  
  useEffect(() => {
    console.log("Loading Microcks Docker Desktop Extension");

    initializeFileSystem();

    getHome().then(result => {
      console.log("Home path: " + result);
      if (result != null) {
        result = result.replace(/\n/g, '');
        appDir = result + "/.microcks-docker-desktop-extension";
        console.log("Extension dir: " + appDir);
      }
    });
    getExtensionConfig().then(result => {
      config = result;
      writePropertiesFiles(config);
    });

    getContainerInfo(APP_CONTAINER).then(info => appStatus = info);
    getContainerInfo(POSTMAN_CONTAINER).then(info => postmanStatus = info);
    getContainerInfo(MONGO_CONTAINER).then(info => mongoStatus = info);
    getContainerInfo(KAFKA_CONTAINER).then(info => kafkaStatus = info);
    getContainerInfo(ASYNC_MINION_CONTAINER).then(info => asyncMinionStatus = info);
  });

  async function initializeFileSystem() {
    const result = await ddClient.extension.host?.cli.exec('createvolumes.sh', [], 
    {
      stream: {
        onOutput(data: { stdout: string; stderr?: undefined } | { stdout?: undefined; stderr: string }): void {
          if (data.stdout) {
            console.error("[data:stdout] " + data.stdout);
          } else {
            console.error(data.stderr);
          }
        },
        onError(error: any): void {
          console.error('Filesystem intialization error: ' + error);
        },
        onClose(exitCode: number): void {
          console.log('Filesystem initialization finished with exit code ' + exitCode);
        },
      },
    });
  }

  async function launchMicrocks() {
    console.log("Launch Microcks!");
    ddClient.desktopUI.toast.success('Starting Microcks...');
    
    /*
    // Simple docker run command from docker-decompose ;-)
    docker run -d --name "mongo" -v "~/tmp/microcks-data:/data/db" "mongo:3.4.23"
    docker run -d --name "postman" "quay.io/microcks/microcks-postman-runtime:latest"
    docker run -d --name "kafka" -p "9092:9092" -p "19092:19092" "vectorized/redpanda:v21.10.2" "redpanda start --overprovisioned --smp 1  --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092"
    docker run -d --name "app" -e "SERVICES_UPDATE_INTERVAL=0 0 0/2 * * *" -e "SPRING_PROFILES_ACTIVE=prod" -e "KEYCLOAK_ENABLED=false" -e "KAFKA_BOOTSTRAP_SERVER=kafka:19092" -e "SPRING_DATA_MONGODB_URI=mongodb://mongo:27017" -e "TEST_CALLBACK_URL=http://microcks:8080" -e "SPRING_DATA_MONGODB_DATABASE=microcks" -e "ASYNC_MINION_URL=http://microcks-async-minion:8081" -e "POSTMAN_RUNNER_URL=http://postman:3000" -p "8080:8080" -p "9090:9090" -v "./config:/deployments/config" "quay.io/microcks/microcks:latest"
    docker run -d --name "async-minion" -e "QUARKUS_PROFILE=docker-compose" -p "8081:8081" --restart "on-failure" -v "./config:/deployments/config" "quay.io/microcks/microcks-async-minion:latest"
    */

    ensureNetworkExists().then(exists => {
      if (exists) {
        if (mongoStatus && !mongoStatus.isRunning) {
          if (!mongoStatus.exists) {
            const mongoRes = ddClient.docker.cli.exec("run", ["-d",
              "--name", MONGO_CONTAINER,
              "--network", EXTENSION_NETWORK,
              "--hostname", "mongo",
              "-v", appDir + "/data:/data/db",
              "mongo:3.4.23"],
              { stream: buildStreamingOpts(MONGO_CONTAINER) }
            );
            mongoStatus.exists = true;
          } else {
            const mongoRes = ddClient.docker.cli.exec("start", [MONGO_CONTAINER]);
          }
          mongoStatus.isRunning = true;
        }
    
        if (postmanStatus && !postmanStatus.isRunning) {
          if (!postmanStatus.exists) {
            const postmanRes = ddClient.docker.cli.exec("run", ["-d",
              "--name", POSTMAN_CONTAINER,
              "--network", EXTENSION_NETWORK,
              "--hostname", "postman",
              "quay.io/microcks/microcks-postman-runtime:latest"],
              { stream: buildStreamingOpts(POSTMAN_CONTAINER) }
            );
            postmanStatus.exists = true;
          } else {
            const postmanRes = ddClient.docker.cli.exec("start", [POSTMAN_CONTAINER]);
          }
          postmanStatus.isRunning = true;
        }
    
        if (appStatus && !appStatus.isRunning) {
          if (!appStatus.exists) {
            const appRes = ddClient.docker.cli.exec("run", ["-d",
              "--name", APP_CONTAINER,
              "--network", EXTENSION_NETWORK,
              "--hostname", "microcks",
              "-v", appDir + "/config:/deployments/config",
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
              { stream: buildStreamingOpts(APP_CONTAINER) }
            );
            appStatus.exists = true;
          } else {
            const appRes = ddClient.docker.cli.exec("start", [APP_CONTAINER]);
          }
          appStatus.isRunning = true;
        }

        if (config.asyncEnabled) {
          console.info("Async configuration is enabled, launching async related containers...")
          if (kafkaStatus && !kafkaStatus.isRunning) {
            if (!kafkaStatus.exists) {
              const kafkaRes = ddClient.docker.cli.exec("run", ["-d",
                "--name", KAFKA_CONTAINER,
                "--network", EXTENSION_NETWORK,
                "--hostname", "kafka",
                "-p", "9092:9092", "-p", "19092:19092",
                "vectorized/redpanda:v21.10.2",
                "redpanda start --overprovisioned --smp 1 --memory 1G --reserve-memory 0M --node-id 0 --check=false --kafka-addr PLAINTEXT://0.0.0.0:19092,EXTERNAL://0.0.0.0:9092 --advertise-kafka-addr PLAINTEXT://kafka:19092,EXTERNAL://localhost:9092"],
                { stream: buildStreamingOpts(KAFKA_CONTAINER) }
              );
              kafkaStatus.exists = true;
            } else {
              const kafkaRes = ddClient.docker.cli.exec("start", [KAFKA_CONTAINER]);
            }
            kafkaStatus.isRunning = true;
          }

          if (asyncMinionStatus && !asyncMinionStatus.isRunning) {
            if (!asyncMinionStatus.exists) {
              const minionRes = ddClient.docker.cli.exec("run", ["-d",
                "--name", ASYNC_MINION_CONTAINER,
                "--network", EXTENSION_NETWORK,
                "--hostname", "microcks-async-minion",
                "-e", "QUARKUS_PROFILE=docker-compose",
                "--restart", "on-failure",
                "-p", "8081:8081",
                "quay.io/microcks/microcks-async-minion:latest"],
                { stream: buildStreamingOpts(ASYNC_MINION_CONTAINER) }
              );
              asyncMinionStatus.exists = true;
            } else {
              const minionRes = ddClient.docker.cli.exec("start", [ASYNC_MINION_CONTAINER]);
            }
            asyncMinionStatus.isRunning = true;
          }
        }
      } else {
        // TODO: Manage this low-level error.
        console.error('Error while ensuring extension network exists');
      }
    });
  }

  function buildStreamingOpts(container: string): any {
    return {
      onOutput(data: any) {
        if (data.stdout) {
          console.error("[%s] " + data.stdout, container);
        } else {
          console.log("[%s] " + data.stderr, container);
        }
      },
      onError(error: any) { console.error("[%s] " + error, container); },
      onClose(exitCode: any) { console.log("[%s] " + "onClose with exit code " + exitCode, container); },
      splitOutputLines: true,
    };
  }

  return (
    <Box
      display="flex"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Button variant="contained" onClick={launchMicrocks}>
        Launch Microcks!
      </Button>
    </Box>
  );
}
