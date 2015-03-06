// This script expects an array of json objects.
// It 1) adds id and type fields to each object, since Cloudsearch expects all JSON objects to have these fields, and
// 2) converts any value fields that are of type "object" to type string, since Cloudsearch cannot index json objects as field values.
var uuid = require('node-uuid');

exports.cloudsearchifyDocuments = function(allProducts) {
  var csAllProducts = [];

  //iterate over all health plans
  allProducts.forEach(function(product){

    // add type and id to very document to index, as required by Cloudsearch.
    // generate random unique hash for each id
    var csProduct = {
      "type": "add",
      "id": uuid.v4()
    };

    csProduct["fields"] = product;
    csAllProducts.push(csProduct);
  });

  return JSON.stringify(csAllProducts);
};
