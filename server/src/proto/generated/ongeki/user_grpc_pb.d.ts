// GENERATED CODE -- DO NOT EDIT!

// package: mythos.ongeki.v0
// file: ongeki/user.proto

import * as ongeki_user_pb from "../ongeki/user_pb";
import * as grpc from "@grpc/grpc-js";

interface IOngekiUserService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getPlaylog: grpc.MethodDefinition<ongeki_user_pb.GetPlaylogRequest, ongeki_user_pb.GetPlaylogStreamItem>;
}

export const OngekiUserService: IOngekiUserService;

export interface IOngekiUserServer extends grpc.UntypedServiceImplementation {
  getPlaylog: grpc.handleServerStreamingCall<ongeki_user_pb.GetPlaylogRequest, ongeki_user_pb.GetPlaylogStreamItem>;
}

export class OngekiUserClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getPlaylog(argument: ongeki_user_pb.GetPlaylogRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<ongeki_user_pb.GetPlaylogStreamItem>;
  getPlaylog(argument: ongeki_user_pb.GetPlaylogRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<ongeki_user_pb.GetPlaylogStreamItem>;
}
