'use strict';

var express = require('express');
var controller = require('./product.controller.js');
var config = require('../config/environment/index');

var util = require('util');

var router = express.Router();
router.post('/', controller.searchCart);

module.exports = router;
