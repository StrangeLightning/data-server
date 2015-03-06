// This script expects an array of json objects.
// It 1) adds id and type fields to each object, since Cloudsearch expects all JSON objects to have these fields, and
// 2) converts any value fields that are of type "object" to type string, since Cloudsearch cannot index json objects as field values.
var uuid = require('node-uuid');

exports.cloudsearchifyDocuments = function(allProducts) {
  var csAllProducts = [];

  //iterate over all health plans
  allProducts.forEach(function(product){

    //get keys and objects from each health plan
    // for(var key in product) {

    //   //filter only values of type object - we need to convert objects for strings for Cloudsearch
    //   if(product.hasOwnProperty(key) && typeof product[key] === "object") {

    //     // get keys and values of any healthplan fields of type object
    //     for(var key2 in product[key]) {
    //       if(product[key].hasOwnProperty(key2)) {

    //         //set healthplan value to value of nested object
    //         //*Note, this deletes the nested objects key, which we're okay with
    //         product[key] = product[key][key2];
    //       }
    //     }
    //   }
    // }

    // add type and id to very document to index, as required by Cloudsearch.
    // generate random unique hash for each id
    var csProduct = {
      "type": "add",
      "id": uuid.v4()
    };

    csProduct["fields"] = product;
    console.log(csProduct, "CSPRODUCT");
    csAllProducts.push(csProduct);
  });

  return JSON.stringify(csAllProducts);
};
