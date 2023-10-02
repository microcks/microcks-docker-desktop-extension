export type ServiceType =
  | 'SOAP_HTTP'
  | 'REST'
  | 'GENERIC_REST'
  | 'EVENT'
  | 'GENERIC_EVENT'
  | 'GRPC'
  | 'GRAPHQL';

export type Service = {
  id: string;
  name: string;
  version: string;
  type: ServiceType;
  operations: Operation[];
};

export type Operation = {
  bindings: string[];
  name: string;
  method: string;
  dispatcher: string;
  dispatcherRules: string;
  resourcePaths: string[];
};
