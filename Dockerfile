FROM --platform=$BUILDPLATFORM node:18.20.5-alpine3.20 AS client-builder
WORKDIR /app/client
# cache packages in layer
COPY client/package.json /app/client/package.json
COPY client/yarn.lock /app/client/yarn.lock
ARG TARGETARCH
RUN yarn config set cache-folder /usr/local/share/.cache/yarn-${TARGETARCH}
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn
# install
COPY client /app/client
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-${TARGETARCH} yarn build
COPY docker-compose.yaml docker-compose.yaml


FROM debian:bullseye-slim
LABEL org.opencontainers.image.title="Microcks" \
    org.opencontainers.image.description="API Mocking and Testing for REST, GraphQL, gRPC and AsyncAPI." \
    org.opencontainers.image.vendor="Microcks" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.desktop.extension.icon="https://microcks.io/images/microcks-logo-blue.png" \
    com.docker.extension.screenshots="[ \
        {\"alt\": \"Welcome page - light screenshot\", \"url\": \"https://raw.githubusercontent.com/microcks/microcks-docker-desktop-extension/main/resources/screenshots/1.png\"}, \
        {\"alt\": \"Welcome page - dark screenshot\", \"url\": \"https://raw.githubusercontent.com/microcks/microcks-docker-desktop-extension/main/resources/screenshots/2.png\"}, \
        {\"alt\": \"Settings pane - light screenshot\", \"url\": \"https://raw.githubusercontent.com/microcks/microcks-docker-desktop-extension/main/resources/screenshots/3.png\"}, \
        {\"alt\": \"Settings pane - dark screenshot\", \"url\": \"https://raw.githubusercontent.com/microcks/microcks-docker-desktop-extension/main/resources/screenshots/4.png\"}, \
        {\"alt\": \"Running - light screenshot\", \"url\": \"https://raw.githubusercontent.com/microcks/microcks-docker-desktop-extension/main/resources/screenshots/5.png\"}, \
        {\"alt\": \"Running - light screenshot\", \"url\": \"https://raw.githubusercontent.com/microcks/microcks-docker-desktop-extension/main/resources/screenshots/6.png\"} \
    ]" \
    com.docker.extension.detailed-description="<p>The Microcks Docker Desktop Extension allows you to easily run Microcks for mocking and testing all kinds of APIs.</p> \
        <h2 id="-features">✨ What can you do with Microcks?</h2> \
        <ul> \
        <li>Mock REST APIs importing local OpenAPI specification or Postman collections,</li> \
        <li>Mock GraphQL APIs importing GraphQL Schema and samples via Postman collections,</li> \
        <li>Mock gRPC APIs importing Protobul and samples via Postman collections,</li> \
        <li>Simulate event-driven APIs (both on Kafka and WebSockets) importing AsyncAPI specification,</li> \
        <li>Test local REST, GraphQL, gRPC, WebSocket and Kafka endpoints to check conformance,</li> \
        <li>Bootstrap your API specification using Direct APIs!</li> \
        </ul> \
    " \
    com.docker.extension.publisher-url="https://www.microcks.io" \
    com.docker.extension.additional-urls="[{\"title\":\"Getting started\",\"url\":\"https://microcks.io/documentation/getting-started\"},{\"title\":\"Source code\",\"url\":\"https://github.com/microcks/microcks-docker-desktop-extension\"}]" \
    com.docker.extension.changelog=""

COPY --from=client-builder /app/client/build ui
COPY docker-compose.yaml .
COPY metadata.json .
COPY host ./host
COPY microcks.svg .
