/*
 * Copyright The Microcks Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
