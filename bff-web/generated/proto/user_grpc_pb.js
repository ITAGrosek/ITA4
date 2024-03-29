// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var proto_user_pb = require('../proto/user_pb.js');

function serialize_com_feri_bookusers_UserRequest(arg) {
  if (!(arg instanceof proto_user_pb.UserRequest)) {
    throw new Error('Expected argument of type com.feri.bookusers.UserRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_com_feri_bookusers_UserRequest(buffer_arg) {
  return proto_user_pb.UserRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_com_feri_bookusers_UserResponse(arg) {
  if (!(arg instanceof proto_user_pb.UserResponse)) {
    throw new Error('Expected argument of type com.feri.bookusers.UserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_com_feri_bookusers_UserResponse(buffer_arg) {
  return proto_user_pb.UserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// The service definition.
var UserServiceService = exports.UserServiceService = {
  // Sends a greeting
createUser: {
    path: '/com.feri.bookusers.UserService/CreateUser',
    requestStream: false,
    responseStream: false,
    requestType: proto_user_pb.UserRequest,
    responseType: proto_user_pb.UserResponse,
    requestSerialize: serialize_com_feri_bookusers_UserRequest,
    requestDeserialize: deserialize_com_feri_bookusers_UserRequest,
    responseSerialize: serialize_com_feri_bookusers_UserResponse,
    responseDeserialize: deserialize_com_feri_bookusers_UserResponse,
  },
  getUser: {
    path: '/com.feri.bookusers.UserService/GetUser',
    requestStream: false,
    responseStream: false,
    requestType: proto_user_pb.UserRequest,
    responseType: proto_user_pb.UserResponse,
    requestSerialize: serialize_com_feri_bookusers_UserRequest,
    requestDeserialize: deserialize_com_feri_bookusers_UserRequest,
    responseSerialize: serialize_com_feri_bookusers_UserResponse,
    responseDeserialize: deserialize_com_feri_bookusers_UserResponse,
  },
  updateUser: {
    path: '/com.feri.bookusers.UserService/UpdateUser',
    requestStream: false,
    responseStream: false,
    requestType: proto_user_pb.UserRequest,
    responseType: proto_user_pb.UserResponse,
    requestSerialize: serialize_com_feri_bookusers_UserRequest,
    requestDeserialize: deserialize_com_feri_bookusers_UserRequest,
    responseSerialize: serialize_com_feri_bookusers_UserResponse,
    responseDeserialize: deserialize_com_feri_bookusers_UserResponse,
  },
  deleteUser: {
    path: '/com.feri.bookusers.UserService/DeleteUser',
    requestStream: false,
    responseStream: false,
    requestType: proto_user_pb.UserRequest,
    responseType: proto_user_pb.UserResponse,
    requestSerialize: serialize_com_feri_bookusers_UserRequest,
    requestDeserialize: deserialize_com_feri_bookusers_UserRequest,
    responseSerialize: serialize_com_feri_bookusers_UserResponse,
    responseDeserialize: deserialize_com_feri_bookusers_UserResponse,
  },
  listUsers: {
    path: '/com.feri.bookusers.UserService/ListUsers',
    requestStream: false,
    responseStream: true,
    requestType: proto_user_pb.UserRequest,
    responseType: proto_user_pb.UserResponse,
    requestSerialize: serialize_com_feri_bookusers_UserRequest,
    requestDeserialize: deserialize_com_feri_bookusers_UserRequest,
    responseSerialize: serialize_com_feri_bookusers_UserResponse,
    responseDeserialize: deserialize_com_feri_bookusers_UserResponse,
  },
};

exports.UserServiceClient = grpc.makeGenericClientConstructor(UserServiceService);
