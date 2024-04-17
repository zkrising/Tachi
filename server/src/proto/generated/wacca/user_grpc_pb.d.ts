// GENERATED CODE -- DO NOT EDIT!

// package: mythos.wacca.v0
// file: wacca/user.proto

import * as wacca_user_pb from "../wacca/user_pb";
import * as grpc from "@grpc/grpc-js";

interface IWaccaUserService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getData: grpc.MethodDefinition<wacca_user_pb.DataRequest, wacca_user_pb.DataResponse>;
  getPlaylog: grpc.MethodDefinition<wacca_user_pb.PlaylogRequest, wacca_user_pb.PlaylogStreamItem>;
}

export const WaccaUserService: IWaccaUserService;

export interface IWaccaUserServer extends grpc.UntypedServiceImplementation {
  getData: grpc.handleUnaryCall<wacca_user_pb.DataRequest, wacca_user_pb.DataResponse>;
  getPlaylog: grpc.handleServerStreamingCall<wacca_user_pb.PlaylogRequest, wacca_user_pb.PlaylogStreamItem>;
}

export class WaccaUserClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  getData(argument: wacca_user_pb.DataRequest, callback: grpc.requestCallback<wacca_user_pb.DataResponse>): grpc.ClientUnaryCall;
  getData(argument: wacca_user_pb.DataRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<wacca_user_pb.DataResponse>): grpc.ClientUnaryCall;
  getData(argument: wacca_user_pb.DataRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<wacca_user_pb.DataResponse>): grpc.ClientUnaryCall;
  getPlaylog(argument: wacca_user_pb.PlaylogRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<wacca_user_pb.PlaylogStreamItem>;
  getPlaylog(argument: wacca_user_pb.PlaylogRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<wacca_user_pb.PlaylogStreamItem>;
}
