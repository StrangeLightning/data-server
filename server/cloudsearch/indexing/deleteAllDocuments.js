// This script deletes documents from Cloudsearch.
// **Limit is deleting 10000 documents at a time.
var cloudsearchdomain = require(__dirname + "/../../config/endpoints").cloudsearchdomain;
var totalDeletes = 0;

var numberToDelete = 1000;
exports.deleteAllDocuments = function() {
  var params = {
    query: '(matchall)', /* required */
    queryParser: 'structured',
    return: '_no_fields',
    size: numberToDelete
  };

  cloudsearchdomain.search(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);
    }
    else {
      exports.deleteDocuments(data.hits.hit);
    }
  });
};

exports.deleteDocuments = function(docs){
  for(var i=0;i<docs.length;i++){
    docs[i]["type"] = "delete";
  }

  var params = {
    contentType: 'application/json',
    documents: JSON.stringify(docs)
  };

  cloudsearchdomain.uploadDocuments(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);
    }
    else {
      totalDeletes += data.deletes;
      console.log("Deleted " + totalDeletes +  " documents.");
      if(data.deletes === numberToDelete){
        exports.deleteAllDocuments();
      } else {
        process.exit();
      }
    }
  });
};

exports.deleteAllDocuments();
