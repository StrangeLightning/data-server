var cloudsearch = require(__dirname + "/../config/endpoints").cloudsearch;
var describeIndexFields = require(__dirname + "/describeIndexFields");
var toDomain = require(__dirname + "/../config/endpoints").toDomain;

var numberIndexed = 0;
exports.defineIndexField = function(params) {
  cloudsearch.defineIndexField(params, function(err, data) {
    if(err) {
      console.log(err, err.stack);

      //retry all 500 responses, as this is caused by AWS throttling
      exports.defineIndexField(params);
    } else {
      numberIndexed += 1;
      console.log(numberIndexed + " index fields created.");
    }
  });
};

var defineIndex = function() {
  //initially copy index fields from another cloudsearch index
  describeIndexFields.describeIndexFields().then(function(indexFields) {
    indexFields.forEach(function(obj) {
      var params = {
        DomainName: toDomain,
        IndexField: {
          IndexFieldType: obj.Options.IndexFieldType,
          IndexFieldName: obj.Options.IndexFieldName
        }
      };

      // call defineIndexField for each index field
      exports.defineIndexField(params);
    });
  }).catch(function(err) {
    console.log(err);
  });
};

defineIndex();
