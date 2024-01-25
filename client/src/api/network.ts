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
import { createDockerDesktopClient } from "@docker/extension-api-client";

import { EXTENSION_NETWORK } from "../utils/constants";
import { throwErrorAsString } from "./utils";

const ddClient = createDockerDesktopClient();

export async function ensureNetworkExists(): Promise<boolean> {
  console.info('Ensuring a bridge network exists for extension...');
  let networkResult;
  try {
    networkResult = await ddClient.docker.cli.exec("network", ["inspect", EXTENSION_NETWORK]);
  } catch (e: any) {
    if (e.stderr?.includes('No such network') || e.stderr?.includes('not found')) {
      // Create missing network for our extension.
      console.info('Creating a bridge network for extension.');
      try {
        networkResult = await ddClient.docker.cli.exec("network", ["create",
          "--label", "com.docker.compose.project=microcks_microcks-docker-desktop-extension-desktop-extension", "--driver", "bridge", EXTENSION_NETWORK]);
      } catch (ee: any) {
        throwErrorAsString(ee);
      }
    }
  }
  return true;
}