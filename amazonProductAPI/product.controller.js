'use strict';

var config = require('../../config/environment');
var OperationHelper = require('apac').OperationHelper;

exports.searchCart = function(callback) {
  var opHelper = new OperationHelper({
    awsId: config.amazon.clientID,
    awsSecret: config.amazon.clientSecret,
    assocId: config.amazon.clientAccount
  });

  opHelper.execute('ItemSearch', {
    'Keywords': 'toys',
    'SearchIndex': 'Blended',
    'ItemPage': '1',
    'TruncateReviewsAt': '0',
    'Availability': 'Available',
    'ResponseGroup': 'Similarities,ItemIds,ItemAttributes,Images,Reviews,Offers'
  }, callback);
};

