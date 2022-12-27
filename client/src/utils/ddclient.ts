import { createDockerDesktopClient } from '@docker/extension-api-client';

const client = createDockerDesktopClient();

export const useDockerDesktopClient = () => {
  return client;
};
