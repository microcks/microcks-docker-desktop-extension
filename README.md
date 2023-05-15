# Microcks Docker Desktop Extension

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/microcks/microcks-docker-desktop-extension/build-verify.yml?branch=main&logo=github&style=for-the-badge)](https://github.com/microcks/microcks-docker-desktop-extension/actions)
[![Container](https://img.shields.io/docker/v/microcks/microcks-docker-desktop-extension?sort=semver&color=blue&logo=docker&style=for-the-badge&label=Docker.io)](https://hub.docker.com/r/microcks/microcks-docker-desktop-extension/tags)
[![License](https://img.shields.io/github/license/microcks/microcks?style=for-the-badge&logo=apache)](https://www.apache.org/licenses/LICENSE-2.0)
[![Project Chat](https://img.shields.io/badge/chat-on_zulip-pink.svg?color=ff69b4&style=for-the-badge&logo=zulip)](https://microcksio.zulipchat.com/)

This extension tries to simplify the getting started experience for developers using Microcks in their local environments. This extension will start the components to run a local deployment of Microcks using container images.

For any recommendations, suggestions, feature requests and issue, head over the the project's GitHub Issues tracker.

## Install

Since Docker Desktop v4.10 the extension CLI is included with the standard installation.

To install the extension:

```bash
$ docker extension install microcks/microcks-docker-extension:latest
```

## Build it locally

Build the extension image locally with `make build-extension`:

```sh
$ make build-extension
docker build --tag=microcks/microcks-docker-desktop-extension:latest .
[...]
 => => naming to docker.io/microcks/microcks-docker-desktop-extension:latest
```

Install the extension using the `docker extension` SDK and command:

```sh
$ docker extension install microcks/microcks-docker-desktop-extension:latest
```

When iterating, use the following command:

```sh
$ make build-extension && docker extension update microcks/microcks-docker-desktop-extension:latest -f
```

or see the option to just develop the frontend locally [here](https://docs.docker.com/desktop/extensions-sdk/dev/test-debug/#hot-reloading-whilst-developing-the-ui).
