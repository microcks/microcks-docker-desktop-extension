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
import { createDockerDesktopClient } from '@docker/extension-api-client';

import { ContainerStatus } from "../types/ContainerStatus";
import { throwErrorAsString } from './utils';

const ddClient = createDockerDesktopClient();

/** */
export async function getContainerInfo(container: string): Promise<ContainerStatus> {
  console.info('Looking for ' + container + ' container info.');
  
  let existFlag: boolean = false;
  let runningFlag: boolean = false;

  let containerInfo;
  try {
    containerInfo = await ddClient.docker.cli.exec("inspect", [container]);

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
  } catch (e: any) {
    if (e.stderr !== undefined && (e.stderr.includes('No such object'))) {
      console.info(container + ' info - exists: ' + existFlag + ', is running: ' + runningFlag);
      return new ContainerStatus(false, false);
    } else {
      throwErrorAsString(e);
    }
  }
  
  console.info(container + ' info - exists: ' + existFlag + ', is running: ' + runningFlag);
  return new ContainerStatus(existFlag, runningFlag);
}