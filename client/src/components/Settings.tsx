import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import { ExtensionConfig } from '../types/ExtensionConfig';

type Props = {
  config: ExtensionConfig;
  isDialogOpen: boolean;
  handleCloseDialog: (newConfig: ExtensionConfig | undefined | null) => void;
};

const Settings: React.FC<Props> = ({
  isDialogOpen,
  handleCloseDialog,
  config,
}) => {
  const [{ portOffset, asyncEnabled }, setLocalConfig] = useState(config);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  console.log(config);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, valueAsNumber, value, checked } = event.target;
    console.log(name, value);
    setLocalConfig((prevState) => ({
      ...prevState,
      [name]: name === 'portOffset' ? valueAsNumber : checked,
    }));
  };

  const handleClose = (newConfig: ExtensionConfig | undefined | null) => {
    handleCloseDialog(newConfig);
    if (!newConfig) setLocalConfig(config);
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={(event, reason) => handleClose(null)}
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack justifyContent="center" alignItems="flex-start" spacing={2}>
          <FormControl margin="normal">
            <FormControlLabel
              control={
                <Checkbox
                  name="asyncEnabled"
                  checked={asyncEnabled}
                  onChange={handleChange}
                />
              }
              label="Enable Asynchronous APIs"
            />
          </FormControl>
          <TextField
            id="portoffset"
            name="portOffset"
            margin="normal"
            variant="standard"
            type="number"
            label="Port Offset:"
            value={portOffset}
            onChange={handleChange}
            helperText="Use an offset to avoid port conflicts"
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' },
              },
            }}
          />
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={(event) => handleClose(null)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={(event) =>
            handleClose({
              asyncEnabled: asyncEnabled,
              portOffset: portOffset,
            })
          }
        >
          {'Apply & Restart'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings;
