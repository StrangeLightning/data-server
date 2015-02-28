// This script indexes documents in Cloudsearch.
var csd = require(__dirname + '/cloudsearchifyDocuments.js');
var cloudsearchdomain = require(__dirname + "/../../config/endpoints").cloudsearchdomain;
var amazonProductApi = require(__dirname + "/../../amazonProductAPI/product.controller");
var numberOfDocuments = 100000;
var count = 0;
var uniqueProductsContainer = {};

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

// Expecting: [[{product},[1,5,3,..],[{product},[1,5,3,..]...]
// add x, y, z coordinates to products that orients the products in the 3D world based on the popularity of a single product,
// and then webbing related products out from there
var insertModelCoordinates = function(productObjectPlusAdjacencyListArray, products) {
  products = products || [];

  // base case - initially one most popular product with 5 similar products, each with 5 similar, each with similar
  // so 1 + 5 * 5 * 5 = 126
  if(products.length > 126){
    return products;
  }

  productObjectPlusAdjacencyListArray.forEach(function(productObjectPlusAdjacencyList){
    var originalProduct = productObjectPlusAdjacencyList[0];
    var adjacencyList = productObjectPlusAdjacencyList[1];
    var productIndex;

    // add original product to products to return
    originalProduct = addCoordinatesToProduct(originalProduct, 0, 0, 0);
    products.push(originalProduct);

    // dequeue products from adjacency list and add coordinates to those products
    var i = 0;
    while(productIndex = adjacencyList.pop()){
      // assuming 5 products in adjacency list, create the following coordinates:
      //[1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0],
      var coordinates = [0,0,0];
      coordinates[i % 3] = i < 3 ? 1 : -1;
      var relatedProductObjectPlusAdjacencyList = productObjectPlusAdjacencyListArray[productIndex];

      // recurse through related product
      insertModelCoordinates(relatedProductObjectPlusAdjacencyList);

      // add coordinates to related product
      relatedProductObjectPlusAdjacencyList = addCoordinatesToProduct(relatedProductObjectPlusAdjacencyList, coordinates[0], coordinates[1], coordinates[2]);

      // add related product from adjacency list to products to return
      products.push(relatedProductObjectPlusAdjacencyList);
      i++;
    }
  });
};

// helper function to add coordinates to product
var addCoordinatesToProduct = function(relatedProductObjectPlusAdjacencyList, x, y, z){
  relatedProductObjectPlusAdjacencyList[0].coordinates = {
    x: x,
    y: y,
    z: z
  };

  return relatedProductObjectPlusAdjacencyList;
};

recurse = function(pageNo) {

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

            // add coordinates to place products on screen as 3d models
            product.x = 0;
            product.y = 0;
            product.z = 0;

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



