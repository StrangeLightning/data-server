// This script expects an array of json objects.
// It 1) adds id and type fields to each object, since Cloudsearch expects all JSON objects to have these fields, and
// 2) converts any value fields that are of type "object" to type string, since Cloudsearch cannot index json objects as field values.
var uuid = require('node-uuid');

exports.cloudsearchifyDocuments = function(allHealthPlans) {
  var csAllHealthPlans = [];

  //iterate over all health plans
  allHealthPlans.forEach(function(healthPlan){

    //get keys and objects from each health plan
    for(var key in healthPlan) {

      //filter only values of type object - we need to convert objects for strings for Cloudsearch
      if(healthPlan.hasOwnProperty(key) && typeof healthPlan[key] === "object") {

        // get keys and values of any healthplan fields of type object
        for(var key2 in healthPlan[key]) {
          if(healthPlan[key].hasOwnProperty(key2)) {

            //set healthplan value to value of nested object
            //*Note, this deletes the nested objects key, which we're okay with
            healthPlan[key] = healthPlan[key][key2];
          }
        }
      }
    }

    // add type and id to very document to index, as required by Cloudsearch.
    // generate random unique hash for each id
    var csHealhPlan = {
      "type": "add",
      "id": uuid.v4()
    };

    csHealhPlan["fields"] = healthPlan;
    csAllHealthPlans.push(csHealhPlan);
  });

  return JSON.stringify(csAllHealthPlans);
};
