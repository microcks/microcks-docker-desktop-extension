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
export const APPLICATION_PROPERTIES = `
    # Async mocking support.
    async-api.enabled=true

    # Access to Microcks API server.
    %docker-compose.io.github.microcks.minion.async.client.MicrocksAPIConnector/mp-rest/url=http://microcks:8080

    # Access to Keycloak through docker network
    %docker-compose.keycloak.auth.url=http://keycloak:8080/auth

    # Access to Kafka broker.
    %docker-compose.kafka.bootstrap.servers=kafka:19092

    # Do not save any consumer-offset on the broker as there's a re-sync on each minion startup.
    %docker-compose.mp.messaging.incoming.microcks-services-updates.enable.auto.commit=false
    %docker-compose.mp.messaging.incoming.microcks-services-updates.bootstrap.servers=kafka:19092

    # Explicitly telling the minion the protocols we want to support
    %docker-compose.minion.supported-bindings=KAFKA,WS
`;

export const FEATURES_PROPERTIES = `
    features.feature.async-api.enabled=true
    features.feature.async-api.frequencies=3,10,30
    features.feature.async-api.default-binding=KAFKA
    features.feature.async-api.endpoint-KAFKA=localhost:9092
    features.feature.async-api.endpoint-MQTT=my-mqtt-broker.apps.try.microcks.io:1883
    features.feature.async-api.endpoint-AMQP=my-amqp-broker.apps.try.microcks.io:5672
    features.feature.async-api.endpoint-WS=localhost:8081
`;