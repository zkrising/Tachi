// GENERATED CODE -- DO NOT EDIT!

// package: mythos.chunithm.v0
// file: chunithm/user.proto

import * as chunithm_user_pb from "../chunithm/user_pb";
import * as grpc from "@grpc/grpc-js";

interface IChunithmUserService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getPlaylog: grpc.MethodDefinition<chunithm_user_pb.GetPlaylogRequest, chunithm_user_pb.GetPlaylogStreamItem>;
}

export const ChunithmUserService: IChunithmUserService;

export interface IChunithmUserServer extends grpc.UntypedServiceImplementation {
  getPlaylog: grpc.handleServerStreamingCall<chunithm_user_pb.GetPlaylogRequest, chunithm_user_pb.GetPlaylogStreamItem>;
}

export class ChunithmUserClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getPlaylog(argument: chunithm_user_pb.GetPlaylogRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<chunithm_user_pb.GetPlaylogStreamItem>;
  getPlaylog(argument: chunithm_user_pb.GetPlaylogRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<chunithm_user_pb.GetPlaylogStreamItem>;
}
