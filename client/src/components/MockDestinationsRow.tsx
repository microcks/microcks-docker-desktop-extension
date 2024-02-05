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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import { ExtensionConfig } from '../types/ExtensionConfig';
import {
  Operation,
  Service,
} from '../types/Service';
import { useDockerDesktopClient } from '../utils/ddclient';
import ClipboardCopy from './ClipboardCopy';
import { Stack } from '@mui/material';

interface MockDestinationsRowProps {
  service: Service;
  operation: Operation;
  config: ExtensionConfig;
}

const MockDestinationsRow: React.FC<MockDestinationsRowProps> = ({
  service,
  operation,
  config,
}) => {
  const ddClient = useDockerDesktopClient();

  const getAsyncUrl = (binding: string): string => {
    let url = "localhost";
    if (binding === 'WS') {
      let serviceName = service.name.replace(/\s/g, '+');
      let versionName = service.version.replace(/\s/g, '+');
      let operationName = removeVerbInUrl(operation.name);
      // if(dispatchCriteria != null) {}

      url = `${url}:${8081 + config.portOffset}/api/ws/${serviceName}/${versionName}/${operationName}`;
    } else if (binding === 'KAFKA') {
      url = `${url}:${9092 + config.portOffset}`;
    }
    return url;
  }

  const removeVerbInUrl = (operationName: string): string => {
    if (
      operationName.startsWith('GET ') ||
      operationName.startsWith('PUT ') ||
      operationName.startsWith('POST ') ||
      operationName.startsWith('DELETE ') ||
      operationName.startsWith('OPTIONS ') ||
      operationName.startsWith('PATCH ') ||
      operationName.startsWith('HEAD ') ||
      operationName.startsWith('TRACE ') ||
      operationName.startsWith('SUBSCRIBE ') ||
      operationName.startsWith('PUBLISH ')
    ) {
      operationName = operationName.slice(operationName.indexOf(' ') + 1);
    }
    return operationName;
  };

  const formatAsyncDestination = (binding: string): string => {
    let name = "";
    if (binding === 'WS') {
      const bindings: any = operation.bindings
      name = bindings[binding].method;
    } else if (binding === 'KAFKA') {
      name = service.name.replace(/\s/g, '').replace(/-/g, '') +
        '-' + service.version +
        '-' + operation.name.replace(operation.method + ' ', '').replace(/\//g, '-');
    }
    return name;
  };

  return (
    <Stack spacing={2}>
      {Object.keys(operation.bindings).map((binding: any) =>
        binding === 'KAFKA' || binding === 'WS' ? (
          <Box
            key={binding}
            display="flex"
            flexDirection="column"
          >
            <Typography variant="body1">
              {binding} endpoint:{' '}
              <Link variant="subtitle1" underline="hover">
                {getAsyncUrl(binding)}
              </Link>
              <ClipboardCopy copyText={getAsyncUrl(binding)} />
            </Typography>
            {binding == 'KAFKA' && (
              <Typography variant="body1">
                {binding} destination: {''}
                <Link variant="subtitle1" underline="hover">
                  {formatAsyncDestination(binding)}
                </Link>
                <ClipboardCopy copyText={formatAsyncDestination(binding) || ''} />
              </Typography>
            )}
            {binding == 'WS' && (
              <Typography variant="body1">
                {binding} method: {''}
                <Typography variant="body1" component="span" fontWeight="600">
                  {formatAsyncDestination(binding)}
                </Typography>
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            key={binding}
            display="flex"
            flexWrap="wrap"
          >
            <WarningAmberIcon />
            <Typography variant="body1" component="span" marginLeft={1}>
              This extension does not support the {binding} binding at this time.
            </Typography>
          </Box>
        ),
      )}
    </Stack>
  )
};

export default MockDestinationsRow;