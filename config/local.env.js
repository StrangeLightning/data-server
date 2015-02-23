'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.
// http://webservices.amazon.com/onca/xml?Service=AWSECommerceService&Operation=ItemSearch&AWSAccessKeyId=AKIAJQKCMAUYT23FNJTA&SearchIndex=Apparel&Keywords=Shirt

module.exports = {
  AMAZON_ID: 'AKIAIFRSJNG4TYQIULGA',
  AMAZON_SECRET: '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',
  AMAZON_ACCOUNT: '7652-5325-8613',
  AMAZON_A_ID: 'sphereable-20',

  CLOUDSEARCH_AMAZON_ID: 'AKIAIXP2R4BWPXPU4KNA',
  CLOUDSEARCH_AMAZON_SECRET: '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',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
