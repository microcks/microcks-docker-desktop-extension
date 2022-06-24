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
import { ExtensionConfig } from "../types/ExtensionConfig";
import { APPLICATION_PROPERTIES, FEATURES_PROPERTIES } from "../utils/config";
import { execOnHost, throwErrorAsString } from "./utils";

export async function initializeFileSystem(): Promise<boolean> {
  let cmdResult;
  try {
    cmdResult = await execOnHost('createvolumes.sh', 'createvolumes.bat', []);
  } catch (e: any) {
    console.error('Filesystem intialization error: ' + e);
    return false;
  }
  if (!cmdResult.code) {
    console.log('Filesystem initialization finished without exit code');
    return true
  } else if (cmdResult.code == 0) {
    console.log('Filesystem initialization finished with exit code ' + cmdResult.code);
    return true;
  }
  return false;
}

export async function getHome(): Promise<string> {
  let cmdResult;
  try {
    cmdResult = await execOnHost('readhome.sh', 'readhome.bat', []);
  } catch (e: any) {
    throwErrorAsString(e);
  }
  return cmdResult.stdout;
}

/** */
export async function getExtensionConfig(): Promise<ExtensionConfig> {
  let cmdResult;
  try {
    cmdResult = await execOnHost('readconf.sh', 'readconf.bat', []);
  } catch (e: any) {
    if (e.stderr !== undefined && (e.stderr.includes('file not found') || e.stderr.includes('The system cannot find the file specified.'))) {
      return new ExtensionConfig();
    }
    throwErrorAsString(e);
  }

  let extensionConfig: ExtensionConfig;
  try {
    extensionConfig = JSON.parse(cmdResult.stdout);
  } catch (e: any) {
    console.log('Failed while parsing configuration file', e);
    throw 'Failed while parsing configuration file';
  }
  return extensionConfig;
}

/** */
export async function writeExtensionConfig(config: ExtensionConfig) {
  let cmdResult;
  try {
    cmdResult = await execOnHost('writeconf.sh', 'writeconf.bat', [JSON.stringify(config)]);
  } catch (e: any) {
    throwErrorAsString(e);
  }
}

/** */
export async function writePropertiesFiles(config: ExtensionConfig) {
  // Prepare customized properties content depending on ExtensionConfig.
  // For now: just use the default.
  let applicationProperties = APPLICATION_PROPERTIES;
  let featuresProperties = FEATURES_PROPERTIES;

  let cmdResult;
  try {
    cmdResult = await execOnHost('writeproperties.sh', 'writeproperties.bat', ['"' + applicationProperties + '"', '"' + featuresProperties + '"']);
  } catch (e: any) {
    throwErrorAsString(e);
  }
}
