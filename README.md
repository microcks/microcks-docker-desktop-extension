# microcks-docker-desktop-extension

Docker Desktop extension for running Microcks

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

or see the option to just develop the frontend locally [here](https://docs.docker.com/desktop/extensions-sdk/tutorials/initialize/#developing-the-frontend).