// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var maimai_user_pb = require('../maimai/user_pb.js');
var maimai_playlog_pb = require('../maimai/playlog_pb.js');

function serialize_mythos_maimai_v0_GetPlaylogRequest(arg) {
  if (!(arg instanceof maimai_user_pb.GetPlaylogRequest)) {
    throw new Error('Expected argument of type mythos.maimai.v0.GetPlaylogRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_maimai_v0_GetPlaylogRequest(buffer_arg) {
  return maimai_user_pb.GetPlaylogRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_maimai_v0_GetPlaylogStreamItem(arg) {
  if (!(arg instanceof maimai_user_pb.GetPlaylogStreamItem)) {
    throw new Error('Expected argument of type mythos.maimai.v0.GetPlaylogStreamItem');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_maimai_v0_GetPlaylogStreamItem(buffer_arg) {
  return maimai_user_pb.GetPlaylogStreamItem.deserializeBinary(new Uint8Array(buffer_arg));
}


var MaimaiUserService = exports.MaimaiUserService = {
  getPlaylog: {
    path: '/mythos.maimai.v0.MaimaiUser/GetPlaylog',
    requestStream: false,
    responseStream: true,
    requestType: maimai_user_pb.GetPlaylogRequest,
    responseType: maimai_user_pb.GetPlaylogStreamItem,
    requestSerialize: serialize_mythos_maimai_v0_GetPlaylogRequest,
    requestDeserialize: deserialize_mythos_maimai_v0_GetPlaylogRequest,
    responseSerialize: serialize_mythos_maimai_v0_GetPlaylogStreamItem,
    responseDeserialize: deserialize_mythos_maimai_v0_GetPlaylogStreamItem,
  },
};

exports.MaimaiUserClient = grpc.makeGenericClientConstructor(MaimaiUserService);
