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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { APP_CONTAINER } from '../utils/constants';
import { useDockerDesktopClient } from '../utils/ddclient';

import UploadIcon from '@mui/icons-material/Upload';
import { ExtensionConfig } from '../types/ExtensionConfig';
import { Service } from '../types/Service';
import ImportDialog from './ImportDialog';
import ServiceRow from './ServiceRow';

const Services = ({config}: { config: ExtensionConfig }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isImportDialog, setIsImportDialog] = useState(false)

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

  const handleOpenImport = () => {setIsImportDialog(true)};

  const handleCloseImportDialog = () => {setIsImportDialog(false)};

  return (
    <>
    <Box sx={{ width: '100%', alignItems: 'center' }} my={5}>
      <Box display="flex" flex="row" justifyContent="space-between">
        <Typography variant="h3">Services</Typography>
        <Button startIcon={<UploadIcon/>} variant="contained" size="large" onClick={handleOpenImport}>
          Import Service
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
    <ImportDialog config={config} isDialogOpen={isImportDialog} closeHandler={handleCloseImportDialog}/>
    </>
  );
};

export default Services;
