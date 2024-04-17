// GENERATED CODE -- DO NOT EDIT!

// package: mythos.cards.v0
// file: cards/cards.proto

import * as cards_cards_pb from "../cards/cards_pb";
import * as grpc from "@grpc/grpc-js";

interface ICardsService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  lookup: grpc.MethodDefinition<cards_cards_pb.LookupRequest, cards_cards_pb.LookupResponse>;
}

export const CardsService: ICardsService;

export interface ICardsServer extends grpc.UntypedServiceImplementation {
  lookup: grpc.handleUnaryCall<cards_cards_pb.LookupRequest, cards_cards_pb.LookupResponse>;
}

export class CardsClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  lookup(argument: cards_cards_pb.LookupRequest, callback: grpc.requestCallback<cards_cards_pb.LookupResponse>): grpc.ClientUnaryCall;
  lookup(argument: cards_cards_pb.LookupRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<cards_cards_pb.LookupResponse>): grpc.ClientUnaryCall;
  lookup(argument: cards_cards_pb.LookupRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<cards_cards_pb.LookupResponse>): grpc.ClientUnaryCall;
}
