FROM golang:1.17-alpine AS builder

ENV CGO_ENABLED=0
WORKDIR /backend

# Download dependencies
COPY go.* .
RUN go mod download

# Now compile main.go
COPY main.go .
RUN go build -trimpath -ldflags="-s -w" -o bin/service


FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

MAINTAINER Laurent Broudoux <laurent.broudoux@gmail.com>

ENV CLI=/usr/local/bin/microcks-dde-metrics \
    USER_UID=1001 \
    USER_NAME=microcks-dde-metrics

# Install binary
COPY --from=builder /backend/bin/service ${CLI}

# Setup permissions for user '1001'. Necessary to permit running with a randomised UID.
COPY build/bin /usr/local/bin
RUN  /usr/local/bin/user_setup

USER ${USER_UID}

# Run it
ENTRYPOINT [ "/usr/local/bin/microcks-dde-metrics" ]