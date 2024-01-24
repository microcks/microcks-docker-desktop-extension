import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { throwErrorAsString } from '../api/utils';
import { ExtensionConfig } from '../types/ExtensionConfig';
import {
  MessagesMap,
  Operation,
  ReqRespPair,
  Service,
  UnidirEvent,
} from '../types/Service';
import { useDockerDesktopClient } from '../utils/ddclient';
import MockURLRow from './MockURLRow';
import ServiceTypeLabel from './ServiceTypeLabel';

const ServiceRow = (props: { service: Service; config: ExtensionConfig }) => {
  const [open, setOpen] = React.useState(false);
  const [messagesMap, setMessagesMap] = useState<MessagesMap>();

  const ddClient = useDockerDesktopClient();

  const { service, config } = props;

  const singleRowTypes = ['GRAPHQL', 'GRPC'];

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
                      <TableCell width="20%">Method</TableCell>
                      <TableCell width="20%">Path</TableCell>
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
                                        (!singleRowTypes.includes(
                                          service.type,
                                        ) ||
                                          index === 0) && (
                                          <ListItem key={index} disablePadding>
                                            <MockURLRow
                                              offset={config.portOffset}
                                              operation={operation}
                                              service={service}
                                              bindings={operation.bindings}
                                              dispatchCriteria={
                                                (value as ReqRespPair).response
                                                  .dispatchCriteria
                                              }
                                            />
                                          </ListItem>
                                        )
                                      ) : value.type === 'unidirEvent' &&
                                        index === 0 ? (
                                        <ListItem key={index} disablePadding>
                                          <MockURLRow
                                            offset={config.portOffset}
                                            operation={operation}
                                            service={service}
                                            bindings={operation.bindings}
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
                              <MockURLRow
                                offset={config.portOffset}
                                operation={operation}
                                service={service}
                              />
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
