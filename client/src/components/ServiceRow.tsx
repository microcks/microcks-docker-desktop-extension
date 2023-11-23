import React, { useState } from 'react';
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
import {
  MessagesMap,
  Operation,
  ReqRespPair,
  Service,
  UnidirEvent,
} from '../types/Service';
import ServiceTypeLabel from './ServiceTypeLabel';
import { useDockerDesktopClient } from '../utils/ddclient';
import MockURLRow from './MockURLRow';
import { ExtensionConfig } from '../types/ExtensionConfig';
import { APP_CONTAINER } from '../utils/constants';
import { throwErrorAsString } from '../api/utils';

const ServiceRow = (props: { service: Service; config: ExtensionConfig }) => {
  const [open, setOpen] = React.useState(false);
  const [messagesMap, setMessagesMap] = useState<MessagesMap>();

  const ddClient = useDockerDesktopClient();

  const { service, config } = props;

  const retrieveServiceDetail = async () => {
    try {
      const response = await fetch(
        `http://localhost:${8080 + config.portOffset || 8080}/api/services/${
          service.id
        }`,
      );

      if (!response.ok) {
        console.error(response.statusText);
        return;
      }

      const svc = (await response.json()) as Service;
      console.log(svc);
      setMessagesMap(svc.messagesMap);
    } catch (error) {
      throwErrorAsString(error);
    }
  };

  const formatDestinationName = (operation: Operation): string => {
    const name =
      service.name.replace(/\s/g, '').replace(/-/g, '') +
      '-' +
      service.version +
      '-' +
      operation.name.replace(operation.method + ' ', '').replace(/\//g, '-');
    return name;
  };

  const encodeUrl = (url: string): string => {
    return url.replace(/\s/g, '+');
  };

  const formatMockUrl = (
    operation: Operation,
    dispatchCriteria?: string | null,
  ): string => {
    var result = `http://localhost:${8080 + config.portOffset}`;

    if (service.type === 'REST') {
      result += '/rest/';
      result += encodeUrl(service.name) + '/' + service.version;

      var parts: { [key: string]: string } = {};
      var params = {};
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
        partsCriteria.split('/').forEach((element, index, array) => {
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
            {service.name}
          </Typography>
        </TableCell>
        <TableCell width="20%" align="left">
          <ServiceTypeLabel type={service.type}></ServiceTypeLabel>
        </TableCell>
        <TableCell width="20%" align="left">
          <Typography component="span">Version: {service.version}</Typography>
        </TableCell>
        <TableCell width="20%" align="right">
          <Button
            variant="text"
            onClick={() =>
              ddClient.host.openExternal(
                `http://localhost:${8080 + config.portOffset}/#/services/${
                  service.id
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
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            onEnter={(node, isAppearing) => {
              retrieveServiceDetail();
            }}
          >
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
                    {service.operations
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
                            {service.type.includes('EVENT') &&
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
                            ) : messagesMap ? (
                              messagesMap[operation.name].length ? (
                                <List>
                                  {messagesMap[operation.name].map(
                                    (value: ReqRespPair | UnidirEvent, index) =>
                                      value.type === 'reqRespPair' ? (
                                        <ListItem key={index} disablePadding>
                                          <MockURLRow
                                            bindings={operation.bindings}
                                            destination={formatDestinationName(
                                              operation,
                                            )}
                                            mockURL={formatMockUrl(
                                              operation,
                                              (value as ReqRespPair).response
                                                .dispatchCriteria,
                                            )}
                                          />
                                        </ListItem>
                                      ) : value.type === 'unidirEvent' &&
                                        index === 0 ? (
                                        <ListItem key={index} disablePadding>
                                          <MockURLRow
                                            bindings={operation.bindings}
                                            destination={formatDestinationName(
                                              operation,
                                            )}
                                            mockURL={formatMockUrl(operation)}
                                          />
                                        </ListItem>
                                      ) : (
                                        <></>
                                      ),
                                  )}
                                </List>
                              ) : (
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
                                    There are no examples to mock for this
                                    operation
                                  </Typography>
                                </Box>
                              )
                            ) : (
                              <MockURLRow mockURL={formatMockUrl(operation)} />
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
