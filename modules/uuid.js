var git_sha1 = require('git-sha1');
// var bigInt = require("big-integer");

exports = module.exports;

// uuid are stored in hex
var uuid;

exports.gen = function () {
  uuid = git_sha1((~~(Math.random() * 1e9)).toString(36) + Date.now());
  return uuid;
  // console.log('in hex \t', uuid.toString());
  // console.log('in dec \t', bigInt(uuid, 16).toString());
  // console.log('to hex \t', bigInt(uuid, 16).toString(16));
};

exports.get = exports.uuid = function () {
  return uuid;
};