/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./server/config/environment');
var schedule = require('node-schedule');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Setup server
var app = express();
var serverHTTP = require('http').createServer(app);

var rule = new schedule.RecurrenceRule();
rule.minute = 42;

if (process.env.NODE_ENV === 'production') {
  serverHTTP.listen(80, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });

  //schedule indexing of MongoDB
  schedule.scheduleJob(rule, function () {

  });
} else if (process.env.NODE_ENV === 'development') {
  serverHTTP.listen(8080, "localhost", function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });

  schedule.scheduleJob(rule, function () {

  });
}

require('./server/config/express')(app);
require('./server/routes')(app);

// Expose app
exports = module.exports = app;