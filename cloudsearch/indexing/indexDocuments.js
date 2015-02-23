// This script indexes documents in Cloudsearch.
var csd = require(__dirname + '/cloudsearchifyDocuments.js');
var cloudsearchdomain = require(__dirname + "/../config/endpoints").cloudsearchdomain;
var amazonProductApi = require("../../../amazonProductAPI/product.controller.js");
var numberOfDocuments = 10000;

var count = 0;
exports.indexDocuments = function(data) {
  var params = {
    contentType: 'application/json',
    documents: csd.cloudsearchifyDocuments(data)
  };

  return cloudsearchdomain.uploadDocuments(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);
    }
    else {
      count += data.adds;
      console.log(count + " documents indexed!");
    }
  });
};

var recurse = function(i) {

  amazonProductApi.searchCart(function(err, results) {
    var _results = [];
    var r2 = results.ItemSearchResponse.Items[0].Item;
    while(_results.length < 12 && r2 && r2[i]) {
      var obj = r2[i];
      var product = {};

      // Sometimes no ItemAttributes Returned
      if(obj.ItemAttributes &&
        obj.ItemAttributes[0].ListPrice &&
        obj.ItemAttributes[0].Title &&
        obj.MediumImage &&
        obj.CustomerReviews &&
        obj.CustomerReviews[0].IFrameURL &&
        obj.Offers &&
        obj.Offers[0].TotalOffers &&
        +obj.Offers[0].TotalOffers[0] > 0) {
        product.id = obj.ASIN[0];
        product.price = obj.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
        product.title = obj.ItemAttributes[0].Title[0];
        product.mediumImage = obj.MediumImage[0].URL[0];
        product.reviews = obj.CustomerReviews[0].IFrameURL[0];
        _results.push(product);
        numberOfDocuments--;
      }
      i++;
    }

    exports.indexDocuments(_results);

    if(numberOfDocuments > 0) {
      recurse(i + 1)
    } else {
      process.exit();
    }
  });
};

recurse(0);



