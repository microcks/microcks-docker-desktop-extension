# Microcks Docker Desktop Extension

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/microcks/microcks-docker-desktop-extension/build-verify.yml?branch=main&logo=github&style=for-the-badge)](https://github.com/microcks/microcks-docker-desktop-extension/actions)
[![Container](https://img.shields.io/docker/v/microcks/microcks-docker-desktop-extension?sort=semver&color=blue&logo=docker&style=for-the-badge&label=Docker.io)](https://hub.docker.com/r/microcks/microcks-docker-desktop-extension/tags)
[![License](https://img.shields.io/github/license/microcks/microcks?style=for-the-badge&logo=apache)](https://www.apache.org/licenses/LICENSE-2.0)
[![Project Chat](https://img.shields.io/badge/discord-microcks-pink.svg?color=7289da&style=for-the-badge&logo=discord)](https://microcks.io/discord-invite/)
[![Artifact HUB](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/microcks-uber-image&style=for-the-badge)](https://artifacthub.io/packages/search?repo=microcks-uber-image)
[![CNCF Landscape](https://img.shields.io/badge/CNCF%20Landscape-5699C6?style=for-the-badge&logo=cncf)](https://landscape.cncf.io/?item=app-definition-and-development--application-definition-image-build--microcks)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension?ref=badge_shield)

This extension simplifies the getting started experience for developers using Microcks in their local environments. This extension will start the components to run a local deployment of Microcks using container images.

For any recommendations, suggestions, feature requests and issue, head over the project's GitHub Issues tracker.

## Build Status

Latest released version is `0.3.1`.

Current development version is `0.3.2`.

#### Fossa license and security scans

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension?ref=badge_shield&issueType=license)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension?ref=badge_shield&issueType=security)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension.svg?type=small)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension?ref=badge_small)

#### OpenSSF best practices on Microcks core

[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/7513/badge)](https://bestpractices.coreinfrastructure.org/projects/7513)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/microcks/microcks/badge)](https://securityscorecards.dev/viewer/?uri=github.com/microcks/microcks)

## Community

* [Documentation](https://microcks.io/documentation/tutorials/getting-started/)
* [Microcks Community](https://github.com/microcks/community) and community meeting
* Join us on [Discord](https://microcks.io/discord-invite/), on [GitHub Discussions](https://github.com/orgs/microcks/discussions) or [CNCF Slack #microcks channel](https://cloud-native.slack.com/archives/C05BYHW1TNJ)

To get involved with our community, please make sure you are familiar with the project's [Code of Conduct](./CODE_OF_CONDUCT.md).

## Install

Since Docker Desktop v4.10 the extension CLI is included with the standard installation.

To install the extension:

```bash
$ docker extension install microcks/microcks-docker-desktop-extension:latest
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

## Debug

Open Chrome DevTools:

```sh
docker extension dev debug microcks/microcks-docker-desktop-extension:latest
```

Developing the UI

```sh
docker extension dev ui-source microcks/microcks-docker-desktop-extension:latest http://localhost:3000
```

Reset

```sh
docker extension dev reset microcks/microcks-docker-desktop-extension:latest
```



## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmicrocks%2Fmicrocks-docker-desktop-extension?ref=badge_large)