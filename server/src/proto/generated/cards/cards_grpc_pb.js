// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var cards_cards_pb = require('../cards/cards_pb.js');

function serialize_mythos_cards_v0_LookupRequest(arg) {
  if (!(arg instanceof cards_cards_pb.LookupRequest)) {
    throw new Error('Expected argument of type mythos.cards.v0.LookupRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_cards_v0_LookupRequest(buffer_arg) {
  return cards_cards_pb.LookupRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_mythos_cards_v0_LookupResponse(arg) {
  if (!(arg instanceof cards_cards_pb.LookupResponse)) {
    throw new Error('Expected argument of type mythos.cards.v0.LookupResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_mythos_cards_v0_LookupResponse(buffer_arg) {
  return cards_cards_pb.LookupResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var CardsService = exports.CardsService = {
  lookup: {
    path: '/mythos.cards.v0.Cards/Lookup',
    requestStream: false,
    responseStream: false,
    requestType: cards_cards_pb.LookupRequest,
    responseType: cards_cards_pb.LookupResponse,
    requestSerialize: serialize_mythos_cards_v0_LookupRequest,
    requestDeserialize: deserialize_mythos_cards_v0_LookupRequest,
    responseSerialize: serialize_mythos_cards_v0_LookupResponse,
    responseDeserialize: deserialize_mythos_cards_v0_LookupResponse,
  },
};

exports.CardsClient = grpc.makeGenericClientConstructor(CardsService);
