import LaunchIcon from '@mui/icons-material/Launch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useDockerDesktopClient } from '../utils/ddclient';
import ClipboardCopy from './ClipboardCopy';
import { Operation, Service } from '../types/Service';

interface MockURLRowProps {
  offset: number;
  service: Service;
  operation: Operation;
  bindings?: any;
  dispatchCriteria?: any;
}

const MockURLRow: React.FC<MockURLRowProps> = ({
  offset,
  service,
  operation,
  bindings,
  dispatchCriteria,
}) => {
  const ddClient = useDockerDesktopClient();

  const encodeUrl = (url: string): string => {
    return url.replace(/\s/g, '+');
  };

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

  const formatMockUrl = (): string => {
    var result = `http://localhost:${8080 + offset}`;

    if (service.type === 'REST') {
      result += '/rest/';
      result += encodeUrl(service.name) + '/' + service.version;

      var parts: { [key: string]: string } = {};
      var operationName = operation.name;

      if (dispatchCriteria != null) {
        var partsCriteria =
          dispatchCriteria.indexOf('?') == -1
            ? dispatchCriteria
            : dispatchCriteria.substring(0, dispatchCriteria.indexOf('?'));
        var paramsCriteria =
          dispatchCriteria.indexOf('?') == -1
            ? null
            : dispatchCriteria.substring(dispatchCriteria.indexOf('?') + 1);

        partsCriteria = encodeUrl(partsCriteria);
        partsCriteria
          .split('/')
          .forEach((element: any, index: number, array: []) => {
            if (element) {
              parts[element.split('=')[0]] = element.split('=')[1];
            }
          });

        operationName = operationName.replace(
          /{([a-zA-Z0-9-_]+)}/g,
          (match, p1, string) => {
            return parts[p1];
          },
        );
        // Support also Postman syntax with /:part
        operationName = operationName.replace(
          /:([a-zA-Z0-9-_]+)/g,
          (match, p1, string) => {
            return parts[p1];
          },
        );
        if (paramsCriteria != null) {
          operationName += '?' + paramsCriteria.replace(/\?/g, '&');
        }
      }
      result += operationName.replace(operation.method + ' ', '');
    } else if (service.type === 'SOAP_HTTP') {
      result += '/soap/';
      result += encodeUrl(service.name) + '/' + service.version;
    } else if (service.type === 'GRAPHQL') {
      result += '/graphql/';
      result += encodeUrl(service.name) + '/' + service.version;
    } else if (service.type === 'GENERIC_REST') {
      result += '/dynarest/';
      result += encodeUrl(service.name) + '/' + service.version;
      result += operation.name.replace(operation.method + ' ', '');
    } else if (service.type === 'GRPC') {
      result = `http://localhost:${9090 + offset}`;
    }

    return result;
  };

  const asyncDestination = (binding: any): string => {
    if (binding == 'WS') {
      return bindings[binding].method;
    }
    if (binding == 'KAFKA') {
      const name =
        service.name.replace(/\s/g, '').replace(/-/g, '') +
        '-' +
        service.version +
        '-' +
        operation.name.replace(operation.method + ' ', '').replace(/\//g, '-');
      return name;
    }
    return '';
  };

  const asyncEndpoint = (binding: any): string => {
    var result = 'localhost';
    var serviceName = service.name;
    var versionName = service.version;
    var operationName = operation.name;

    if (binding == 'WS') {
      result += 8081 + offset;
      serviceName = serviceName.replace(/\s/g, '+');
      var versionName = service.version.replace(/\s/g, '+');
      operationName = removeVerbInUrl(operationName);

      if (dispatchCriteria != null) {
        // const wsParts = {};
        // let wsPartsCriteria = (dispatchCriteria.indexOf('?') == -1 ? dispatchCriteria : dispatchCriteria.substring(0, dispatchCriteria.indexOf('?')));
        // wsPartsCriteria = encodeUrl(wsPartsCriteria);
        // wsPartsCriteria.split('/').forEach(function(element:any, index:number, array:[]) {
        //   if (element){
        //     wsParts[element.split('=')[0]] = element.split('=')[1];
        //   }
        // });
        // operationName = operationName.replace(/{([a-zA-Z0-9-_]+)}/g, function(match, p1, string) {
        //   return wsParts[p1];
        // });
        // // Support also Postman syntax with /:part
        // operationName = operationName.replace(/:([a-zA-Z0-9-_]+)/g, function(match, p1, string) {
        //   return wsParts[p1];
        // });
      }

      return (
        result +
        '/api/ws/' +
        serviceName +
        '/' +
        versionName +
        '/' +
        operationName
      );
    }
    if (binding == 'KAFKA') {
      result += 9092 + offset;
    }
    return result;
  };

  return bindings ? (
    <Stack spacing={2}>
      {Object.keys(bindings).map((binding: any) =>
        binding == 'KAFKA' || binding == 'WS' ? (
          <Box
            key={binding}
            marginLeft={1}
            display="flex"
            flexDirection="column"
          >
            <Typography variant="body1">
              {bindings[binding].type} endpoint:{' '}
              <Link variant="subtitle1" underline="hover">
                {asyncEndpoint(binding)}
              </Link>
              <ClipboardCopy copyText={asyncEndpoint(binding)} />
            </Typography>

            {binding == 'KAFKA' && (
              <Typography variant="body1">
                {bindings[binding].type} destination: {''}
                <Link variant="subtitle1" underline="hover">
                  {asyncDestination(binding)}
                </Link>
                <ClipboardCopy copyText={asyncDestination(binding) || ''} />
              </Typography>
            )}
            {binding == 'WS' && (
              <Typography variant="body1">
                {bindings[binding].type} method: {''}
                <Typography variant="body1" component="span" fontWeight="600">
                  {asyncDestination(binding)}
                </Typography>
              </Typography>
            )}
          </Box>
        ) : (
          <Box
            key={binding}
            marginLeft={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <WarningAmberIcon />
            <Typography variant="body1" component="span" marginLeft={1}>
              This extension does not support the {binding} binding at this
              time.
            </Typography>
          </Box>
        ),
      )}
    </Stack>
  ) : (
    <Typography noWrap>
      <Link
        onClick={() => ddClient.host.openExternal(formatMockUrl())}
        variant="subtitle1"
        underline="hover"
      >
        {formatMockUrl()}
      </Link>
      <IconButton
        onClick={() => ddClient.host.openExternal(formatMockUrl())}
        component="span"
        size="small"
      >
        <LaunchIcon />
      </IconButton>
      <ClipboardCopy copyText={formatMockUrl()} />
    </Typography>
  );
};

export default MockURLRow;
