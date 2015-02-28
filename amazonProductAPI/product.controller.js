'use strict';

var config = require(__dirname + '/../config/environment');
var OperationHelper = require('apac').OperationHelper;

exports.searchCart = function(pageNo, callback) {
  var opHelper = new OperationHelper({
    awsId: config.amazon.clientID,
    awsSecret: config.amazon.clientSecret,
    assocId: config.amazon.clientAccount
  });

  opHelper.execute('ItemSearch', {
    'Keywords': 'toys',
    'SearchIndex': 'Blended',
    'ItemPage': pageNo,
    'Availability': 'Available',
    'ResponseGroup': 'Similarities,ItemIds,ItemAttributes,Images,Reviews,Offers'
  }, callback);
};


exports.lookup = function(ASIN, callback) {
  var opHelper = new OperationHelper({
    awsId: config.amazon.clientID,
    awsSecret: config.amazon.clientSecret,
    assocId: config.amazon.clientAccount
  });

  opHelper.execute('ItemLookup', {
    'ItemId': ASIN + '',
    'Condition': 'New',
    'Availability': 'Available',
    'ResponseGroup': 'Similarities,ItemIds,ItemAttributes,Images,Reviews,Offers'
  }, callback);
};
