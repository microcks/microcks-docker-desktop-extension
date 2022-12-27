import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';
import React, { useEffect, useState } from 'react';
import { APP_CONTAINER } from '../utils/constants';
import { useDockerDesktopClient } from '../utils/ddclient';
import { Collapse, IconButton, Link } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ExtensionConfig } from '../types/ExtensionConfig';

type Service = {
  id: string;
  name: string;
  version: string;
  type: string;
  operations: Operation[];
};

type Operation = {
  name: string;
  method: string;
  dispatcher: string;
  dispatcherRules: string;
};

const Services = (props: { config: ExtensionConfig }) => {
  const [services, setServices] = useState<Service[]>([]);

  const { config } = props;

  const ddClient = useDockerDesktopClient();

  const getServices = async () => {
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
    getServices();
  }, []);

  const Row = (props: { row: Service }) => {
    const [open, setOpen] = React.useState(false);

    const { row } = props;

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell width="5%">
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            <Typography variant="subtitle1" component="span">
              {row.name}
            </Typography>
          </TableCell>
          <TableCell width="20%" align="right">
            <Typography variant="subtitle1" component="span">
              Version: {row.version}
            </Typography>
          </TableCell>
          <TableCell width="10%" align="right">
            <Chip
              label={
                row.type.startsWith('GENERIC_')
                  ? `DIRECT ${row.type.split('_')[1]}`
                  : row.type
              }
              sx={{
                backgroundColor: '#9c27b0',
                color: 'white',
                borderRadius: '0',
              }}
              component="span"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Operations:
                </Typography>
                {row.operations.map((operation) => (
                  <Box key={operation.name} my={1}>
                    <Chip
                      label={operation.method}
                      sx={{
                        borderRadius: '0',
                        color: 'white',
                        backgroundColor:
                          operation.method == 'GET'
                            ? 'green'
                            : operation.method == 'POST'
                            ? '#ec7a08'
                            : operation.method == 'DELETE'
                            ? '#c00'
                            : '#39a5dc',
                      }}
                    ></Chip>
                    <Typography variant="body1" component="span" mx={2}>
                      {operation.name}{' '}
                      <Link
                        onClick={() =>
                          ddClient.host.openExternal(
                            `http://localhost:${
                              8080 + config.portOffset
                            }/dynarest/${row.name.replace(' ', '+')}/${
                              row.version
                            }${operation.name.split(' ')[1]}`,
                          )
                        }
                        variant="subtitle1"
                        component="button"
                      >
                        http://localhost:
                        {8080 + config.portOffset}
                        /dynarest/
                        {row.name.replace(' ', '+')}/{row.version}
                        {operation.name.split(' ')[1]}
                      </Link>
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ width: '100%', alignItems: 'center' }} my={5}>
      <Typography variant="h3">Services</Typography>
      <Box my={2}>
        <Stack>
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableBody>
                {services.map((service) => (
                  <Row key={service.id} row={service} />
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
