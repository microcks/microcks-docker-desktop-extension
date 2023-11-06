import React from 'react';
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
import { Operation, Service } from '../types/Service';
import ServiceTypeLabel from './ServiceTypeLabel';
import { useDockerDesktopClient } from '../utils/ddclient';
import MockURLRow from './MockURLRow';
import { ExtensionConfig } from '../types/ExtensionConfig';

const ServiceRow = (props: { row: Service; config: ExtensionConfig }) => {
  const [open, setOpen] = React.useState(false);

  const ddClient = useDockerDesktopClient();

  const { row, config } = props;

  const formatDestinationName = (
    service: Service,
    operation: Operation,
  ): string => {
    const name =
      service.name.replace(/\s/g, '').replace(/-/g, '') +
      '-' +
      service.version +
      '-' +
      operation.name.replace(operation.method + " ", '').replace(/\//g, '-');
    return name;
  };

  const encodeUrl = (url: string): string => {
    return url.replace(/\s/g, '+');
  };

  const formatMockUrl = (
    service: Service,
    operation: Operation,
    path?: string,
  ): string => {
    var result = `http://localhost:${8080 + config.portOffset}`;

    if (service.type === 'REST') {
      result += '/rest/';
      result += encodeUrl(service.name) + '/' + service.version;
      result += path;
    } else if (service.type === 'SOAP_HTTP') {
      result += '/soap/';
      result += encodeUrl(service.name) + '/' + service.version;
    } else if (service.type === 'GRAPHQL') {
      result += '/graphql/';
      result += encodeUrl(service.name) + '/' + service.version;
    } else if (service.type === 'GENERIC_REST') {
      result += '/dynarest/';
      result += encodeUrl(service.name) + '/' + service.version;
      result += operation.name.replace(operation.method + " ", '');
    } else if (service.type === 'GRPC') {
      result = `http://localhost:${9090 + config.portOffset}`;
    } else if (service.type === 'EVENT') {
      result = `localhost:${9092 + config.portOffset}`;
    }

    return result;
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'none' } }}>
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
        <TableCell width="20%" align="left">
          <ServiceTypeLabel type={row.type}></ServiceTypeLabel>
        </TableCell>
        <TableCell width="20%" align="left">
          <Typography component="span">Version: {row.version}</Typography>
        </TableCell>
        <TableCell width="20%" align="right">
          <Button
            variant="text"
            onClick={() =>
              ddClient.host.openExternal(
                `http://localhost:${8080 + config.portOffset}/#/services/${
                  row.id
                }`,
              )
            }
          >
            Details
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1} paddingBottom={2}>
              <TableContainer>
                <Table size="small" aria-label="operations">
                  <TableHead>
                    <TableRow>
                      <TableCell>Method</TableCell>
                      <TableCell>Path</TableCell>
                      <TableCell>Mock URL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.operations
                      .sort((a, b) => a.name.length - b.name.length)
                      .map((operation) => (
                        <TableRow key={operation.name}>
                          <TableCell component="th" scope="row">
                            <Typography
                              fontWeight="bold"
                              variant="h6"
                              sx={{
                                borderRadius: '0',
                                color:
                                  operation.method == 'GET'
                                    ? 'green'
                                    : operation.method == 'POST'
                                    ? '#ec7a08'
                                    : operation.method == 'DELETE'
                                    ? '#c00'
                                    : '#39a5dc',
                              }}
                            >
                              {operation.method}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" component="span">
                              {operation.name.replace(operation.method, '')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {row.type.includes('EVENT') &&
                            !config.asyncEnabled ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <WarningAmberIcon />
                                <Typography
                                  variant="body1"
                                  component="span"
                                  marginLeft={1}
                                >
                                  Async APIs are disabled
                                </Typography>
                              </Box>
                            ) : operation.resourcePaths ? (
                              <List>
                                {operation.resourcePaths.map((path, index) => (
                                  <ListItem key={index} disablePadding>
                                    <MockURLRow
                                      bindings={operation.bindings}
                                      destination={formatDestinationName(
                                        row,
                                        operation,
                                      )}
                                      mockURL={formatMockUrl(
                                        row,
                                        operation,
                                        path,
                                      )}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <>
                                <MockURLRow
                                  mockURL={formatMockUrl(row, operation)}
                                />
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default ServiceRow;
