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
import { createDockerDesktopClient } from '@docker/extension-api-client';

import { ContainerStatus } from '../types/ContainerStatus';
import { throwErrorAsString } from './utils';

const ddClient = createDockerDesktopClient();

/** */
export async function getContainerInfo(
  container: string,
): Promise<ContainerStatus> {
  console.info('Looking for ' + container + ' container info.');

  const info = new ContainerStatus(false, false);

  try {
    const containerInfo:any = await ddClient.docker.listContainers(
      { all: true, filters: JSON.stringify({ name: ["^\/"+container+"$"] }) });

    console.log("listContainer: " + container , containerInfo)

    if (containerInfo?.length) {
      info.exists = true;
      var containerObj = containerInfo[0];
      if (containerObj.State === 'running') {
        info.isRunning = true;
      }
      const ports = containerObj.Ports.filter((p: any) => p.PublicPort != undefined).sort((a: any, b: any) => a.PublicPort - b.PublicPort);
      console.log('ports', ports);
      if (ports.length) {
        info.mappedPort =
          ports[0].PublicPort;
      }
    } else {
      info.exists = false;
    }
  } catch (e: any) {
    if (e.stderr !== undefined && e.stderr.toLowerCase().includes('no such object')) {
      console.info(
        container +
          ' info - exists: ' +
          info.exists +
          ', is running: ' +
          info.isRunning,
      );
      return new ContainerStatus(false, false);
    } else {
      throwErrorAsString(e);
    }
  }

  console.info(
    `${container} info - exists: ${info.exists}, is running: ${info.isRunning}, port: ${info.mappedPort}`,
  );
  return info;
}
