'use strict';

var parseString = require('string-template');

function logError (err) {
  if (err) {
    console.error(err);
  }
}

function createCallback (callback) {
  return typeof callback === 'function' ? callback : logError;
}

function getMissingParams (params, required) {
  var missing = [];

  required.forEach(function (param) {
    // Is the required param in the params object?
    if (!params[param]) {
      missing.push(param);
    }
  });

  // If there are any required params missing, return their names in array, otherwise return null
  return missing.length > 0 ? missing : null;
}

function DefaultTransporter(){

};
DefaultTransporter.prototype.request = function(opts, auth, opt_callback) {
  const url = (opts.uri || opts.url) + '?key=' + auth;
  let err = false;
  let response = null;
  return fetch(url, opts).then(
    result => {
      response = result;
      err = result.ok !== true;
      return result.text();
    }
  ).then(text => {
    this.wrapCallback_(opt_callback)(err, response, text);
  });
};

/**
 * Wraps the response callback.
 * @param {Function=} opt_callback Optional callback.
 * @return {Function} Wrapped callback function.
 * @private
 */
DefaultTransporter.prototype.wrapCallback_ = function(opt_callback) {
  return function(err, res, body) {
    if (err || !body) {
      return opt_callback && opt_callback(err, body, res);
    }
    // Only and only application/json responses should
    // be decoded back to JSON, but there are cases API back-ends
    // responds without proper content-type.
    try {
      body = JSON.parse(body);
    } catch (err) { /* no op */ }

    if (body && body.error && res.statusCode !== 200) {
      if (typeof body.error === 'string') {
        err = new Error(body.error);
        err.code = res.statusCode;

      } else if (Array.isArray(body.error.errors)) {
        err = new Error(body.error.errors.map(
                         function(err) { return err.message; }
                       ).join('\n'));
        err.code = body.error.code;
        err.errors = body.error.errors;

      } else {
        err = new Error(body.error.message);
        err.code = body.error.code || res.statusCode;
      }

      body = null;

    } else if (res.statusCode >= 500) {
      // Consider all '500 responses' errors.
      err = new Error(body);
      err.code = res.statusCode;
      body = null;
    }

    if (opt_callback) {
      opt_callback(err, body, res);
    }
  };
};

/**
 * Create and send request to Google API
 * @param  {object}   parameters Parameters used to form request
 * @param  {Function} callback   Callback when request finished or error found
 * @return {Request}             Returns Request object or null
 */
function createAPIRequest (parameters, callback) {
  var req, body, missingParams;
  var params = parameters.params;
  var options = Object.assign({}, parameters.options);

  // If the params are not present, and callback was passed instead,
  // use params as the callback and create empty params.
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  // Create a new params object so it can no longer be modified from outside code
  // Also support global and per-client params, but allow them to be overriden per-request
  params = Object.assign(
    {}, // New base object
    params // API call params
  );

  var media = params.media || {};
  var resource = params.resource;
  var authClient = params.auth;

  var defaultMime = 'text/plain';
  delete params.media;
  delete params.resource;
  delete params.auth;

  // Grab headers from user provided options
  var headers = params.headers || {};
  delete params.headers;

  // Un-alias parameters that were modified due to conflicts with reserved names
  Object.keys(params).forEach(function (key) {
    if (key.slice(-1) === '_') {
      var newKey = key.slice(0, -1);
      params[newKey] = params[key];
      delete params[key];
    }
  });

  // Normalize callback
  callback = createCallback(callback);

  // Check for missing required parameters in the API request
  missingParams = getMissingParams(params, parameters.requiredParams);
  if (missingParams) {
    // Some params are missing - stop further operations and inform the developer which required
    // params are not included in the request
    callback(new Error('Missing required parameters: ' + missingParams.join(', ')));

    return null;
  }

  // delete path parameters from the params object so they do not end up in query
  parameters.pathParams.forEach(function (param) {
    delete params[param];
  });

  // if authClient is actually a string, use it as an API KEY
  if (typeof authClient === 'string') {
    params.key = params.key || authClient;
    authClient = null;
  }

  if (parameters.bodyJSON) {
      options.body = JSON.stringify(parameters.data);
  }

  options.headers = headers;

  options = Object.assign({},
    parameters.context.google._options,
    parameters.context._options,
    options
  );
  const auth = options.auth;
  delete options.auth;
  delete options.params; // We handle params ourselves and Request does not recognise 'params'

  // create request (using authClient or otherwise and return request obj)
  if (authClient) {
    req = authClient.request(options, callback);
  } else {
    req = new DefaultTransporter().request(options, auth, callback);
  }

  if (body) {
    body.pipe(req);
  }
  return req;
}

/**
 * Exports createAPIRequest
 * @type {Function}
 */
module.exports = createAPIRequest;
