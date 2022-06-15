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

export function App() {
  let APP_CONTAINER: string = 'microcks-app';
  let POSTMAN_CONTAINER: string = 'microcks-postman';
  let MONGO_CONTAINER: string  = 'mincrocks-mongodb'
  let KAFKA_CONTAINER: string = 'microcks-kafka';

  let postman_exist: boolean = false;
  let mongo_exist: boolean = false;

  let postman_running: boolean = false;
  let mongo_running: boolean = false;

  const ddClient = createDockerDesktopClient();
  
  useEffect(() => {
    console.log("Loading Microcks Docker Desktop Extension");

    initializeFileSystem();
    refreshContainerInfo(POSTMAN_CONTAINER, postman_exist, postman_running);
    refreshContainerInfo(MONGO_CONTAINER, mongo_exist, mongo_running);
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

  async function refreshContainerInfo(container: string, existFlag: boolean, runningFlag: boolean) {
    console.info('Looking for ' + container + ' container info.');
    runningFlag = false;
    const containerInfo = await ddClient.docker.cli.exec("inspect", [container]);
    var infoObj = containerInfo.parseJsonObject();
    if (infoObj != null && infoObj[0] != null) {
      existFlag = true;
      var containerObj = infoObj[0];
      if (containerObj.State?.Status === 'running') {
        runningFlag = true;
      }
    } else {
      existFlag = false;
    }
    console.log(container + ' info - exists: ' + existFlag + ', is running: ' + runningFlag);
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
   
    if (!mongo_running) {
      if (mongo_exist) {
        const mongoRes = await ddClient.docker.cli.exec("run", [
          "-d", "--name", MONGO_CONTAINER,
          "-v", "/Users/laurent/.microcks-docker-desktop-extension/data:/data/db",
          "mongo:3.4.23"],
          { stream: buildStreamingOpts(MONGO_CONTAINER) }
        );
        mongo_exist = true;
      } else {
        const mongoRes = await ddClient.docker.cli.exec("start", [MONGO_CONTAINER]);
      }
      mongo_running = true;
    }
    if (!postman_running) {
      if (postman_exist) {
        const postmanRes = await ddClient.docker.cli.exec("run", [
          "-d", "--name", POSTMAN_CONTAINER,
          "quay.io/microcks/microcks-postman-runtime:latest"],
          { stream: buildStreamingOpts(POSTMAN_CONTAINER) }
        );
        postman_exist = true;
      } else {
        const postmanRes = await ddClient.docker.cli.exec("start", [POSTMAN_CONTAINER]);
      }
      postman_running = true;
    }
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
