// GENERATED CODE -- DO NOT EDIT!

// package: mythos.maimai.v0
// file: maimai/user.proto

import * as maimai_user_pb from "../maimai/user_pb";
import * as grpc from "@grpc/grpc-js";

interface IMaimaiUserService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getPlaylog: grpc.MethodDefinition<maimai_user_pb.GetPlaylogRequest, maimai_user_pb.GetPlaylogStreamItem>;
}

export const MaimaiUserService: IMaimaiUserService;

export interface IMaimaiUserServer extends grpc.UntypedServiceImplementation {
  getPlaylog: grpc.handleServerStreamingCall<maimai_user_pb.GetPlaylogRequest, maimai_user_pb.GetPlaylogStreamItem>;
}

export class MaimaiUserClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getPlaylog(argument: maimai_user_pb.GetPlaylogRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<maimai_user_pb.GetPlaylogStreamItem>;
  getPlaylog(argument: maimai_user_pb.GetPlaylogRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<maimai_user_pb.GetPlaylogStreamItem>;
}
