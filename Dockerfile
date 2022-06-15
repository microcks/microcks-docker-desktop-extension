FROM --platform=$BUILDPLATFORM node:17.7-alpine3.14 AS client-builder
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


FROM debian:bullseye-slim
LABEL org.opencontainers.image.title="Microcks Docker Extension" \
    org.opencontainers.image.description="Easily run Microcks from Docker Desktop" \
    org.opencontainers.image.vendor="MicrocksIO" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.desktop.extension.icon="https://microcks.io/images/microcks-logo-blue.png" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="<h1>Description</h1><p>This is a sample extension that contains a ReactJS application.</p>" \
    com.docker.extension.publisher-url="https://www.microcks.io" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

COPY --from=client-builder /app/client/dist ui
COPY metadata.json .
COPY host ./host
COPY microcks.svg .
