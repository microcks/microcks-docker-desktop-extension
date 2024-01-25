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
import Chip from '@mui/material/Chip';
import { FC } from 'react';

interface ServiceTypeProps {
  type: string;
}

const ServiceTypeLabel: FC<ServiceTypeProps> = ({ type }) => {

  var label = type;
  var backgroundColor = '#3f9c35';

  if ( type === "GRAPHQL" ) {
    backgroundColor = '#e10098';
  } else if (type == "GRPC") {
    backgroundColor = '#379c9c';
  } else if (type == "EVENT") {
    backgroundColor = '#ec7a08';
  } else if (type == "SOAP_HTTP") {
    backgroundColor = '#39a5dc';
    label = 'SOAP';
  } else if (type == "GENERIC_REST") {
    backgroundColor = '#9c27b0';
    label = 'DIRECT REST';
  } else if (type == "GENERIC_EVENT") {
    backgroundColor = '#9c27b0';
    label = 'DIRECT EVENT';
  }

  return (
    <Chip variant="filled"
      label={label}
      sx={{
        borderRadius: 0,
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: backgroundColor
      }} />
  );
};

export default ServiceTypeLabel
