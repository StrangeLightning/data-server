// This script indexes documents in Cloudsearch.
var csd = require(__dirname + '/cloudsearchifyDocuments.js');
var cloudsearchdomain = require(__dirname + "/../../config/endpoints").cloudsearchdomain;
var amazonProductApi = require(__dirname + "/../../amazonProductAPI/product.controller");

var graphyc = require('../../../graphyc.js');
var numberOfDocuments = 50;
var similarHash = {};
var q = [];
var orderedProducts = [];
var hashCount = 0;
var similarHT = {};
var seenHash = {};
var simArray = [];
var count = 0;
var parCount = 0;

var adjacencyList = [];
var graph = new graphyc.Graph([]);
var numberOfDocuments = 100000;
var count = 0;
var uniqueProductsContainer = {};

exports.indexDocuments = function(data) {
  var obj = data[0];
  obj.adjacency_list = data[1];
  obj = [obj];

  var params = {
    contentType: 'application/json',
    documents: csd.cloudsearchifyDocuments(obj)
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
    var flag = false;

    while(r2 && r2[i] && i < r2.length && i < 15) {
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
        +obj.Offers[0].TotalOffers[0] > 0 &&
        obj.SimilarProducts &&
        obj.SimilarProducts[0].SimilarProduct) {

        // filter out adult products, like dildos
        if(!(obj.ItemAttributes[0].IsAdultProduct && obj.ItemAttributes[0].IsAdultProduct[0] === "1")) {

          //filter out duplicate 'items' sold by different vendors
          if(!uniqueProductsContainer[obj.ASIN[0]]) {
            uniqueProductsContainer[obj.ASIN[0]] = true;
            // similarHash[obj.ASIN[0]] = obj.SimilarProducts[0].SimilarProduct;
            simArray = simArray.concat(obj.SimilarProducts[0].SimilarProduct.map(function(e) {
              e.linkASIN = obj.ASIN[0];
              e.ASIN = e.ASIN[0];
              return e;
            }));
            // build product entry to return to client
            product.product_id = obj.ASIN[0];
            product.price = parseInt(obj.ItemAttributes[0].ListPrice[0].Amount[0] / 100, 10);
            product.title = obj.ItemAttributes[0].Title[0];
            product.img_url = obj.MediumImage[0].URL[0];
            product.prod_attributes = JSON.stringify(obj.ItemAttributes[0]);
            product.category = obj.ItemAttributes[0].ProductGroup[0];

            // add coordinates to place products on screen as 3d models
            product.x = q.length;
            product.y = q.length;
            product.z = q.length;

            product.depth = 0;

            _results.push(product);
            orderedProducts.push(product);

            hashCount++;
            flag = true;
            simArray.forEach(function(e, i) {
                if (!(e.ASIN in seenHash)) {
                  seenHash[e.ASIN] = q.length;
                  q.push(e.ASIN);
                  e.x = product.x + Math.floor((Math.random() - .5 )*500000);
                  e.y = product.y + Math.floor((Math.random() - .5 )*300000);
                  e.z = product.z + Math.floor((Math.random() - .5 )*500000);

                  e.depth = 1;
                  orderedProducts.push(e);
                  console.log(e);
                  // graph.add(e, [])
                }
            });
            //decrement number of total documents we want to return
            numberOfDocuments--;
          }
        }
      }

      //increment counter within while loop
      i++;
    }

    processQ(0);
  });
};

recurse(1);

var someC = 0;
function processQ(index) {

  this.index = index;
  var someC = 0;
  q.forEach(function(e) {
    if (!(e in seenHash)) {
      someC++;
    }
  });
  setTimeout(function(){
    var e = q[index];
    var element = q[index];

    if (!(e in seenHash) || 1){
      amazonProductApi.lookup(e, function(err, results) {
        if (results.ItemLookupErrorResponse && results.ItemLookupErrorResponse.Error) {
          console.log (results.ItemLookupErrorResponse.Error[0])
        }
        else {
          var r2 = results.ItemLookupResponse.Items[0].Item;

          // Log errors, if any
          if(results.ItemLookupResponse.Items[0].Request[0].Errors) {
            console.log(results.ItemLookupResponse.Items[0].Request[0].Errors[0].Error[0].Message[0]);
          }

          var obj = r2[0];
          // Sometimes no ItemAttributes Returned
          if(obj.ItemAttributes &&
            obj.ItemAttributes[0].ListPrice &&
            obj.ItemAttributes[0].Title &&
            obj.MediumImage &&
            obj.CustomerReviews &&
            obj.CustomerReviews[0].IFrameURL &&
            obj.Offers &&
            obj.Offers[0].TotalOffers &&
            +obj.Offers[0].TotalOffers[0] > 0 &&
            obj.SimilarProducts &&
            obj.SimilarProducts[0].SimilarProduct) {

            // filter out adult products, like dildos
            if(!(obj.ItemAttributes[0].IsAdultProduct && obj.ItemAttributes[0].IsAdultProduct[0] === "1")) {
              var index = this.index;
              //filter out duplicate 'items' sold by different vendors
              if(!uniqueProductsContainer[obj.ASIN[0]]) {
                uniqueProductsContainer[obj.ASIN[0]] = true;
                // similarHash[obj.ASIN[0]] = obj.SimilarProducts[0].SimilarProduct;
                var fromOrderedProducts = orderedProducts[this.index];

                var someFlag = false;
                var simProds = [];
                var newArray = obj.SimilarProducts[0].SimilarProduct.map(function(e) {
                  e.linkASIN = obj.ASIN[0];
                  e.ASIN = e.ASIN[0];
                  e.Title = e.Title[0];
                  simProds.push(e.ASIN)
                  if (!(e.ASIN in seenHash)) {
                    var product = {};
                    seenHash[e.ASIN] = q.length;
                    someFlag = true;
                    e.x = fromOrderedProducts.x;
                    e.y = fromOrderedProducts.y;
                    e.z = fromOrderedProducts.z;
                    var depth = fromOrderedProducts.depth;
                    e.x = fromOrderedProducts.x + Math.floor((Math.random() - .5 )*500000)*depth;
                    e.y = fromOrderedProducts.y + Math.floor((Math.random() - .5 )*300000)*depth;
                    e.z = fromOrderedProducts.z + Math.floor((Math.random() - .5 )*500000)*depth;
                    e.depth = fromOrderedProducts.depth + 1;
                    q.push(e.ASIN);
                    orderedProducts.push(e);
                  }
                  return e;
                });

                var simProds = simProds.map(function(e) {
                  return seenHash[e];
                });

                var product = {};
                product.product_id = obj.ASIN[0];
                product.price = parseInt(obj.ItemAttributes[0].ListPrice[0].Amount[0] / 100, 10);
                product.title = obj.ItemAttributes[0].Title[0];
                product.img_url = obj.MediumImage[0].URL[0];
                product.prod_attributes = JSON.stringify(obj.ItemAttributes[0]);
                product.category = obj.ItemAttributes[0].ProductGroup[0];
                product.x = fromOrderedProducts.x;
                product.y = fromOrderedProducts.y;
                product.z = fromOrderedProducts.z;
                product.depth = fromOrderedProducts.depth;
                product.adjacency_list = simProds;
                // Add to orderedProducts and graph
                orderedProducts[this.index] = null;
                graph.add([product, simProds]);
                exports.indexDocuments(graph.al[graph.al.length - 1]);

                similarHash[hashCount] = product.product_id;
                similarHT[product.product_id] = hashCount;
                hashCount++;


                //decrement number of total documents we want to return
                numberOfDocuments--;
              }
            }
          }
        }

        processQ(this.index + 1);
      }.bind(this));
    }
  }.bind(this), 1250);
};


