import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import TextField from '@mui/material/TextField';

type Props = {
  portOffset: number;
  isDialogOpen: boolean;
  handleCloseDialog: () => void;
};

const Settings: React.FC<Props> = ({
  portOffset,
  isDialogOpen,
  handleCloseDialog,
}) => {
  return (
    <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth={false}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack>
          <FormControl>
            {/* <FormControlLabel
              control={<Checkbox />}
              label="Enable Asynchronous APIs"
              labelPlacement="start"
            />
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              ml={2}
              justifyContent="flex-end"
            >
              <Typography variant="body1">Port Offset:</Typography>
              <TextField size="small" sx={{ width: 75, ml: 2 }} value="100" />
            </Box> */}
            <Typography variant="subtitle1">
              Microcks will use the following ports:
            </Typography>
            <Typography variant="body1">
              {8080 + portOffset} for main webapp
              <br /> {9090 + portOffset} for gRPC mocking
              <br /> 27117 for MongoDB
              <br /> 3100 for Postman runtime
              <br /> 8280 for Async Minion if enabled
              <br /> 9192 for Kafka if Async is enabled
            </Typography>
          </FormControl>
        </Stack>
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button onClick={handleCloseDialog}>Apply</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default Settings;
