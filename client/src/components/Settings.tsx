import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const Settings = () => {
  return (
    <Stack>
      <Box sx={{ display: "flex", alignContent: "flex-start" }} my={1}>
        <Typography variant="h3">Settings</Typography>
      </Box>
      <FormControl>
        <FormControlLabel
          control={<Checkbox />}
          label="Enable Asynchronous APIs"
        />
      </FormControl>
    </Stack>
  );
};

export default Settings;
