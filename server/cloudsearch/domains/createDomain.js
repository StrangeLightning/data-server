var cloudsearch = require(__dirname + "/../config/endpoints").cloudsearch;
var toDomain = require(__dirname + "/../config/endpoints").toDomain;

exports.createDomain = function(domainName){
  var params = {
    DomainName: toDomain
  };

  cloudsearch.createDomain(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else    {
      console.log(toDomain + " was successfully created.");
    }
  });
};

exports.createDomain();
