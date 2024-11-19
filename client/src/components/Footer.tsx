/*
 * Copyright The Microcks Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PropsWithChildren } from 'react';

const Footer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box textAlign="center" paddingBottom={3} marginTop="auto">
      {children}
      <Typography color="InactiveCaptionText">
        Copyright 2024 Microcks. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
