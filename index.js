'use strict'

const __ = require('underscore');
const Endpoint = require('./lib/clients/v1')
module.exports = {

  Request: require('./lib/models/Request'),

  Feature: require('./lib/models/Feature'),

  Image: require('./lib/models/Image'),

  init(options) {
    if(options){
      options = Object.assign({version: 'v1'}, options)
    }else
      options = options ? options : {};

    var ep = new Endpoint(options)
    ep.google = this
    this._client = ep
  },

  annotate(requests) {
    return new Promise((resolve, reject) => {
      if (!requests) { return reject() }
      if (!__.isArray(requests)) { requests = [requests] }
      this._client.annotate(requests).then(resolve, reject)
    })
  }
}
