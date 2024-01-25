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
  mockURL: string;
}

const MockURLRow: React.FC<MockURLRowProps> = ({
  mockURL
}) => {
  const ddClient = useDockerDesktopClient();

  return (
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
