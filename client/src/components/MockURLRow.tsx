import LaunchIcon from '@mui/icons-material/Launch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useDockerDesktopClient } from '../utils/ddclient';
import ClipboardCopy from './ClipboardCopy';

interface MockURLRowProps {
  bindings?: any;
  mockURL: string;
  destination?: string;
}

const MockURLRow: React.FC<MockURLRowProps> = ({
  bindings,
  mockURL,
  destination,
}) => {
  const ddClient = useDockerDesktopClient();

  return bindings ? (
    <>
      {Object.keys(bindings).map((binding: any) =>
        binding == 'KAFKA' ? (
          <Box
            key={binding}
            marginLeft={1}
            display="flex"
            flexDirection="column"
          >
            <Typography variant="body1">
              {bindings[binding].type} endpoint:{' '}
              <Link variant="subtitle1" underline="hover">
                {mockURL}
              </Link>
              <ClipboardCopy copyText={mockURL} />
            </Typography>
            <Typography variant="body1">
              {bindings[binding].type} destination:{' '}
              <Link variant="subtitle1" underline="hover">
                {destination}
              </Link>
              <ClipboardCopy copyText={destination || ''} />
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
  ) : (
    <Typography noWrap>
      <Link
        onClick={() => ddClient.host.openExternal(mockURL)}
        variant="subtitle1"
        underline="hover"
      >
        {mockURL}
      </Link>
      <IconButton
        onClick={() => ddClient.host.openExternal(mockURL)}
        component="span"
        size="small"
      >
        <LaunchIcon />
      </IconButton>
      <ClipboardCopy copyText={mockURL} />
    </Typography>
  );
};

export default MockURLRow;
