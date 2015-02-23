'use strict';

var path = require('path');
var _ = require('lodash');
var local = {};
try {
  local = require('./../local.env.js');
} catch(err) {
  //do nothing
}

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  amazon: {
    clientID:     process.env.AMAZON_ID || local.AMAZON_ID,
    clientSecret: process.env.AMAZON_SECRET || local.AMAZON_SECRET,
    clientAccount: process.env.AMAZON_ACCOUNT || local.AMAZON_ACCOUNT,
    callbackURL:  (process.env.DOMAIN || '') + '/auth/amazon/callback',

    cloudsearchAmazonId: process.env.CLOUDSEARCH_AMAZON_ID || local.CLOUDSEARCH_AMAZON_ID,
    cloudsearchAmazonSecret: process.env.CLOUDSEARCH_AMAZON_SECRET || local.CLOUDSEARCH_AMAZON_SECRET
  }

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
