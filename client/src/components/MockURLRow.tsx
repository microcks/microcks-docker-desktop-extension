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
import LaunchIcon from '@mui/icons-material/Launch';
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
