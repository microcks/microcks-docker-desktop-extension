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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { APP_CONTAINER } from '../utils/constants';
import { useDockerDesktopClient } from '../utils/ddclient';

import { ExtensionConfig } from '../types/ExtensionConfig';
import MockURLRow from './MockURLRow';
import ServiceTypeLabel from './ServiceTypeLabel';
import { Operation, Service } from '../types/Service';
import ServiceRow from './ServiceRow';

const Services = (props: { config: ExtensionConfig }) => {
  const [services, setServices] = useState<Service[]>([]);

  const { config } = props;

  const ddClient = useDockerDesktopClient();

  const retrieveServices = async () => {
    const result = await ddClient.docker.cli.exec('exec', [
      APP_CONTAINER,
      '/bin/curl',
      '-s',
      '-S',
      'localhost:8080/api/services',
    ]);
    if (result?.stderr) {
      console.error(result.stderr);
      return;
    }
    const svcs = result?.parseJsonObject() as Service[];
    console.log(svcs);
    setServices(svcs);
  };

  useEffect(() => {
    retrieveServices();
  }, []);

  return (
    <Box sx={{ width: '100%', alignItems: 'center' }} my={5}>
      <Box display="flex" flex="row" justifyContent="space-between">
        <Typography variant="h3">Services</Typography>
        <Button variant="contained" size="large" onClick={() => {}}>
          + Add Service
        </Button>
      </Box>
      <Box my={2}>
        <Stack>
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableBody>
                {services.map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    config={config}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Box>
    </Box>
  );
};

export default Services;
