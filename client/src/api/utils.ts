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

const ddClient = createDockerDesktopClient();

let windowsSystem: boolean | undefined;

export function throwErrorAsString(e: any) {
  console.error(e)
  let stringErr: string;
  if (e.stderr !== undefined) {
    stringErr = "An error occurred. You can find the logs in your home directory under \".microcks-desktop-extension/logs\".";
  } else {
    stringErr = e.toString();
  }
  throw stringErr;
}

export async function isWindows(): Promise<boolean> {
  if (windowsSystem === undefined) {
    windowsSystem = navigator.platform.startsWith('Win');
  }
  return windowsSystem;
}

/**
 * Executes a command on the host machine. Results and outputs are returned when the process is closed.
 * @param cmd command, binary or script to run on Windows machines.
 * @param args
 */
 export async function execOnHost(cmd: string, args: string[]): Promise<any> {
  return ddClient.extension.host?.cli.exec(cmd, args);
}