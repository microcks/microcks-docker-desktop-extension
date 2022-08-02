/*
 * Licensed to Laurent Broudoux (the "Author") under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. Author licenses this
 * file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { createDockerDesktopClient } from '@docker/extension-api-client';

var clientID = "";

function send(eventName: string, clientID: string, payload: Object) {
  fetch(`https://microcks-dde-metrics-oafcwlgvlq-ew.a.run.app/collect`, {
    method: "POST",
    body: JSON.stringify({
      client_id: clientID,
      user_id: clientID,
      events: [{
        name: eventName,
        params: payload,
      }]
    })
  }).catch((err: any) => {
    console.log(err);
  });
}

export function sendMetric(eventName: string, payload: Object) {
  if (clientID !== "") {
    send(eventName, clientID, payload);
  } else {
    const ddClient = createDockerDesktopClient();
    ddClient.docker.cli.exec("info", ["--format", "'{{json .}}'"])
      .then((result: any) => {
        if (result.stderr === "") {
          const info = JSON.parse(result.stdout);
          clientID = info.ID;
          send(eventName, info.ID, payload);
        }
      }).catch((err: any) => {
        console.log(err);
      })

  }
};