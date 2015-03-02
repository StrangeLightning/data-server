var cloudsearch = require(__dirname +"/../config/endpoints").cloudsearch;
var domain = require(__dirname + "/../config/endpoints").domain;
var q = require("q");

exports.describeIndexFields = function(){
  var deferred = q.defer();
  var params = {
    DomainName: domain
  };

  cloudsearch.describeIndexFields(params, function(err, data) {
    if (err){
      deferred.reject(err);
    } else {
      var status = data.Status;
      var indexFields = data.IndexFields;

      deferred.resolve(indexFields);
    }
  });

  return deferred.promise;
};