// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var ongeki_user_pb = require('../ongeki/user_pb.js');
var ongeki_playlog_pb = require('../ongeki/playlog_pb.js');

function serialize_mythos_ongeki_v0_GetPlaylogRequest(arg) {
  if (!(arg instanceof ongeki_user_pb.GetPlaylogRequest)) {
    throw new Error('Expected argument of type mythos.ongeki.v0.GetPlaylogRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_ongeki_v0_GetPlaylogRequest(buffer_arg) {
  return ongeki_user_pb.GetPlaylogRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_ongeki_v0_GetPlaylogStreamItem(arg) {
  if (!(arg instanceof ongeki_user_pb.GetPlaylogStreamItem)) {
    throw new Error('Expected argument of type mythos.ongeki.v0.GetPlaylogStreamItem');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_ongeki_v0_GetPlaylogStreamItem(buffer_arg) {
  return ongeki_user_pb.GetPlaylogStreamItem.deserializeBinary(new Uint8Array(buffer_arg));
}


var OngekiUserService = exports.OngekiUserService = {
  getPlaylog: {
    path: '/mythos.ongeki.v0.OngekiUser/GetPlaylog',
    requestStream: false,
    responseStream: true,
    requestType: ongeki_user_pb.GetPlaylogRequest,
    responseType: ongeki_user_pb.GetPlaylogStreamItem,
    requestSerialize: serialize_mythos_ongeki_v0_GetPlaylogRequest,
    requestDeserialize: deserialize_mythos_ongeki_v0_GetPlaylogRequest,
    responseSerialize: serialize_mythos_ongeki_v0_GetPlaylogStreamItem,
    responseDeserialize: deserialize_mythos_ongeki_v0_GetPlaylogStreamItem,
  },
};

exports.OngekiUserClient = grpc.makeGenericClientConstructor(OngekiUserService);
