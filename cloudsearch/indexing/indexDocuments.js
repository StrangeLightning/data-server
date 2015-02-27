// This script indexes documents in Cloudsearch.
var csd = require(__dirname + '/cloudsearchifyDocuments.js');
var cloudsearchdomain = require(__dirname + "/../../config/endpoints").cloudsearchdomain;
var amazonProductApi = require(__dirname + "/../../amazonProductAPI/product.controller");
var numberOfDocuments = 100000;

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

var uniqueProductsContainer = {};
var recurse = function(pageNo) {

  // retrieve products from amazon products api
  amazonProductApi.searchCart(pageNo, function(err, results) {
    var _results = [];
    var r2 = results.ItemSearchResponse.Items[0].Item;

    // Log errors, if any
    if(results.ItemSearchResponse.Items[0].Request[0].Errors) {
      console.log(results.ItemSearchResponse.Items[0].Request[0].Errors[0].Error[0].Message[0]);
    }

    var i = 0;
    while(r2 && r2[i] && i < r2.length) {
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

        // filter out adult products, like dildos
        if(!(obj.ItemAttributes[0].IsAdultProduct && obj.ItemAttributes[0].IsAdultProduct[0] === "1")) {

          //filter out duplicate 'items' sold by different vendors
          if(!uniqueProductsContainer[obj.ASIN[0]]) {
            uniqueProductsContainer[obj.ASIN[0]] = true;

            // build product entry to return to client
            product.product_id = obj.ASIN[0];
            product.price = parseInt(obj.ItemAttributes[0].ListPrice[0].Amount[0] / 100, 10);
            product.title = obj.ItemAttributes[0].Title[0];
            product.img_url = obj.MediumImage[0].URL[0];
            product.prod_attributes = JSON.stringify(obj.ItemAttributes[0]);
            product.category = obj.ItemAttributes[0].ProductGroup[0];

            _results.push(product);

            //decrement number of total documents we want to return
            numberOfDocuments--;
          }
        }
      }

      //increment counter within while loop
      i++;

      //base case - when 12 search items have been built
      if(i === r2.length - 1) {
        if(_results.length > 0){
          exports.indexDocuments(_results);
        }

        // if we have not reached the number of documents to index, continue fetching documents from amazon product api
        if(numberOfDocuments > 0) {
          recurse(pageNo + 1);
        } else {
          process.exit();
        }
      }
    }
  });
};

recurse(1);



