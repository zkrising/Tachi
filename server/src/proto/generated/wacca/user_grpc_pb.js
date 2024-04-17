// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var wacca_user_pb = require('../wacca/user_pb.js');
var wacca_common_pb = require('../wacca/common_pb.js');

function serialize_mythos_wacca_v0_DataRequest(arg) {
  if (!(arg instanceof wacca_user_pb.DataRequest)) {
    throw new Error('Expected argument of type mythos.wacca.v0.DataRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_wacca_v0_DataRequest(buffer_arg) {
  return wacca_user_pb.DataRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_wacca_v0_DataResponse(arg) {
  if (!(arg instanceof wacca_user_pb.DataResponse)) {
    throw new Error('Expected argument of type mythos.wacca.v0.DataResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_wacca_v0_DataResponse(buffer_arg) {
  return wacca_user_pb.DataResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_wacca_v0_PlaylogRequest(arg) {
  if (!(arg instanceof wacca_user_pb.PlaylogRequest)) {
    throw new Error('Expected argument of type mythos.wacca.v0.PlaylogRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_wacca_v0_PlaylogRequest(buffer_arg) {
  return wacca_user_pb.PlaylogRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_wacca_v0_PlaylogStreamItem(arg) {
  if (!(arg instanceof wacca_user_pb.PlaylogStreamItem)) {
    throw new Error('Expected argument of type mythos.wacca.v0.PlaylogStreamItem');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_wacca_v0_PlaylogStreamItem(buffer_arg) {
  return wacca_user_pb.PlaylogStreamItem.deserializeBinary(new Uint8Array(buffer_arg));
}


var WaccaUserService = exports.WaccaUserService = {
  getData: {
    path: '/mythos.wacca.v0.WaccaUser/GetData',
    requestStream: false,
    responseStream: false,
    requestType: wacca_user_pb.DataRequest,
    responseType: wacca_user_pb.DataResponse,
    requestSerialize: serialize_mythos_wacca_v0_DataRequest,
    requestDeserialize: deserialize_mythos_wacca_v0_DataRequest,
    responseSerialize: serialize_mythos_wacca_v0_DataResponse,
    responseDeserialize: deserialize_mythos_wacca_v0_DataResponse,
  },
  getPlaylog: {
    path: '/mythos.wacca.v0.WaccaUser/GetPlaylog',
    requestStream: false,
    responseStream: true,
    requestType: wacca_user_pb.PlaylogRequest,
    responseType: wacca_user_pb.PlaylogStreamItem,
    requestSerialize: serialize_mythos_wacca_v0_PlaylogRequest,
    requestDeserialize: deserialize_mythos_wacca_v0_PlaylogRequest,
    responseSerialize: serialize_mythos_wacca_v0_PlaylogStreamItem,
    responseDeserialize: deserialize_mythos_wacca_v0_PlaylogStreamItem,
  },
  // <unused rpcs removed from Tachi>
};

exports.WaccaUserClient = grpc.makeGenericClientConstructor(WaccaUserService);
