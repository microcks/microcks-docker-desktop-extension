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
  messagesMap: MessagesMap;
};

export type Operation = {
  bindings: string[];
  name: string;
  method: string;
  dispatcher: string;
  dispatcherRules: string;
  resourcePaths: string[];
};

export type BaseMessagesMap = {
  type: "reqRespPair" | "unidirEvent"
}

export type ReqRespPair = {
  request: any;
  response: any;
} & BaseMessagesMap

export type UnidirEvent = {
  eventMessage: any
} & BaseMessagesMap

export type MessagesMap = { 
  [key: string]: ReqRespPair[] | UnidirEvent[] };
