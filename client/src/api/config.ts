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
import { ExtensionConfig } from '../types/ExtensionConfig';
import { APPLICATION_PROPERTIES, FEATURES_PROPERTIES } from '../utils/config';
import { APP_CONTAINER, KAFKA_CONTAINER } from '../utils/constants';
import { execOnHost, isWindows, throwErrorAsString } from './utils';

export async function initializeFileSystem(): Promise<boolean> {
  let cmdResult;
  try {
    cmdResult = await execOnHost(
      (await isWindows()) ? 'createvolumes.bat' : 'createvolumes.sh',
      [],
    );
  } catch (e: any) {
    console.error('Filesystem intialization error: ' + e);
    return false;
  }
  if (!cmdResult.code) {
    console.log('Filesystem initialization finished without exit code');
    return true;
  } else if (cmdResult.code == 0) {
    console.log(
      'Filesystem initialization finished with exit code ' + cmdResult.code,
    );
    return true;
  }
  return false;
}

export async function getHome(): Promise<string> {
  let cmdResult;
  try {
    cmdResult = await execOnHost(
      (await isWindows()) ? 'readhome.bat' : 'readhome.sh',
      [],
    );
  } catch (e: any) {
    throwErrorAsString(e);
  }
  return cmdResult.stdout;
}

/** */
export async function getExtensionConfig(): Promise<ExtensionConfig> {
  let cmdResult;
  try {
    cmdResult = await execOnHost(
      (await isWindows()) ? 'readconf.bat' : 'readconf.sh',
      [],
    );
  } catch (e: any) {
    if (
      e.stderr !== undefined &&
      (e.stderr.includes('file not found') ||
        e.stderr.includes('The system cannot find the file specified.'))
    ) {
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
    if (await isWindows()) {
      cmdResult = await execOnHost('writeconf.bat', [JSON.stringify(config)]);
    } else {
      cmdResult = await execOnHost('writeconf.sh', [
        '"' + JSON.stringify(config).replaceAll('"', '\\"') + '"',
      ]);
    }
    console.log(cmdResult)
  } catch (e: any) {
    throwErrorAsString(e);
  }
}

/** */
export async function writePropertiesFiles(config: ExtensionConfig) {
  // Prepare customized properties content depending on ExtensionConfig.
  // For now: just use the default.
  const applicationProperties = APPLICATION_PROPERTIES;
  const featuresProperties = FEATURES_PROPERTIES;

  console.log('Writing properties file with offset: ' + config.portOffset);

  const customizedApplicationProperties = applicationProperties
    .replaceAll('microcks:8080', APP_CONTAINER + ':8080')
    .replaceAll('kafka:19092', KAFKA_CONTAINER + ':19092')
    .replaceAll('OPENAPI_ENABLED', config.aicopilotEnabled?.toString())
    .replaceAll('OPENAPI_KEY', config.openAiApiKey);

  console.log(customizedApplicationProperties);

  const customizedFeaturesProperties = featuresProperties
    .replaceAll('localhost:9092', 'localhost:' + (9092 + config.portOffset))
    .replaceAll('localhost:8081', 'localhost:' + (8081 + config.portOffset))
    .replaceAll('OPENAPI_ENABLED', config.aicopilotEnabled?.toString());

  console.log(customizedFeaturesProperties);

  let cmdResult;
  try {
    if (await isWindows()) {
      cmdResult = await execOnHost(
        'writeproperties.bat',
        ['"' + customizedApplicationProperties.replaceAll(/(\r\n|\r|\n)/g,'___' ) + '"']
      );
      console.log(cmdResult)
      cmdResult = await execOnHost(
        'writefeatures.bat',
        ['"' + customizedFeaturesProperties.replaceAll(/(\r\n|\r|\n)/g,'___' ) + '"']
        );
      console.log(cmdResult)
    }
    else {
      cmdResult = await execOnHost(
        'writeproperties.sh',
        ['"' + customizedApplicationProperties + '"', '"' + customizedFeaturesProperties + '"']
      );
    }
  } catch (e: any) {
    console.log(e)
    throwErrorAsString(e);
  }
}
