'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.
// http://webservices.amazon.com/onca/xml?Service=AWSECommerceService&Operation=ItemSearch&AWSAccessKeyId=AKIAJQKCMAUYT23FNJTA&SearchIndex=Apparel&Keywords=Shirt

module.exports = {
  AMAZON_ID: '******************',
  AMAZON_SECRET: '*******************',
  AMAZON_ACCOUNT: '********************',
  AMAZON_A_ID: '*********************',

  CLOUDSEARCH_AMAZON_ID: '************************',
  CLOUDSEARCH_AMAZON_SECRET: '***************************',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
