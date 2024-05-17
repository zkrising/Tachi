// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var chunithm_user_pb = require('../chunithm/user_pb.js');
var chunithm_playlog_pb = require('../chunithm/playlog_pb.js');

function serialize_mythos_chunithm_v0_GetPlaylogRequest(arg) {
  if (!(arg instanceof chunithm_user_pb.GetPlaylogRequest)) {
    throw new Error('Expected argument of type mythos.chunithm.v0.GetPlaylogRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_chunithm_v0_GetPlaylogRequest(buffer_arg) {
  return chunithm_user_pb.GetPlaylogRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_chunithm_v0_GetPlaylogStreamItem(arg) {
  if (!(arg instanceof chunithm_user_pb.GetPlaylogStreamItem)) {
    throw new Error('Expected argument of type mythos.chunithm.v0.GetPlaylogStreamItem');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_chunithm_v0_GetPlaylogStreamItem(buffer_arg) {
  return chunithm_user_pb.GetPlaylogStreamItem.deserializeBinary(new Uint8Array(buffer_arg));
}


var ChunithmUserService = exports.ChunithmUserService = {
  getPlaylog: {
    path: '/mythos.chunithm.v0.ChunithmUser/GetPlaylog',
    requestStream: false,
    responseStream: true,
    requestType: chunithm_user_pb.GetPlaylogRequest,
    responseType: chunithm_user_pb.GetPlaylogStreamItem,
    requestSerialize: serialize_mythos_chunithm_v0_GetPlaylogRequest,
    requestDeserialize: deserialize_mythos_chunithm_v0_GetPlaylogRequest,
    responseSerialize: serialize_mythos_chunithm_v0_GetPlaylogStreamItem,
    responseDeserialize: deserialize_mythos_chunithm_v0_GetPlaylogStreamItem,
  },
};

exports.ChunithmUserClient = grpc.makeGenericClientConstructor(ChunithmUserService);
