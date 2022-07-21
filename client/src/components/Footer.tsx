import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer: React.FC = ({ children }) => {
  return (
    <Box className="Footer">
      {children}
      <Typography color="InactiveCaptionText">
        Copyright 2022 Microcks. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
