import LaunchIcon from '@mui/icons-material/Launch';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useDockerDesktopClient } from '../utils/ddclient';
import ClipboardCopy from './ClipboardCopy';
import { Box } from '@mui/material';

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
    <Box marginLeft={1} display="flex" flexDirection="column">
      {Object.keys(bindings).map((binding: any) => (
        <>
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
        </>
      ))}
    </Box>
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
