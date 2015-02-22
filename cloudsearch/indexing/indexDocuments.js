// This script indexes documents in Cloudsearch.
var csd = require(__dirname +'/cloudsearchifyDocuments.js');
var cloudsearchdomain = require(__dirname + "/../config/endpoints").cloudsearchdomain;
var request = require('request');
var healthcareGovApi = "https://data.healthcare.gov/resource/b8in-sz6k.json?$limit=1000";

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

var offset = 1000;
var recurse = function(i){
  var options = {
    "url": healthcareGovApi + "&$offset=" + (offset * i),
    "json": true
  };

  request(options, function(error, message, response){
    if(!error){
      exports.indexDocuments(response);
    } else {
      console.log(error);
    }

    if(response.length === offset){
      recurse(i + 1)
    } else {
      process.exit();
    }
  });
};

recurse(1);



