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
    let url = "";
    if (binding === 'WS') {
      url = `http://localhost:${8081 + config.portOffset}/api/ws/`;
    } else if (binding === 'KAFKA') {
      url = `localhost:${9092 + config.portOffset}`;
    }
    return url;
  }

  const formatAsyncDestination = (binding: string): string => {
    let name = "";
    if (binding === 'WS') {
      name = service.name.replace(/\s/g, '+') +
        '/' + service.version.replace(/\s/g, '+');
        '/' + operation.name.replace(operation.method + ' ', '');
    } else if (binding === 'KAFKA') {
      name = service.name.replace(/\s/g, '').replace(/-/g, '') +
        '-' + service.version +
        '-' + operation.name.replace(operation.method + ' ', '').replace(/\//g, '-');
    }
    return name;
  };

  return (
    <>
      {Object.keys(operation.bindings).map((binding: any) =>
        binding === 'KAFKA' || binding === 'WS' ? (
          <Box
            key={binding}
            marginLeft={1}
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
            <Typography variant="body1">
              {binding} destination:{' '}
              <Link variant="subtitle1" underline="hover">
                {formatAsyncDestination(binding)}
              </Link>
              <ClipboardCopy copyText={formatAsyncDestination(binding) || ''} />
            </Typography>
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
            This extension does not support the {binding} binding at this time.
            </Typography>
          </Box>
        ),
      )}
    </>
  )
};

export default MockDestinationsRow;