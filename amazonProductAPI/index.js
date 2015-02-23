'use strict';

var express = require('express');
var controller = require('./product.controller');
var config = require('../../config/environment');

var util = require('util');

var router = express.Router();
router.post('/', controller.searchCart);

module.exports = router;
