var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();


/* ==========================================================================
 View Setup
 ========================================================================== */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/* ==========================================================================
 Misc Setup
 ========================================================================== */
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


/* ==========================================================================
 Routes
 ========================================================================== */
app.use(require("./routes/index"));
app.use(require("./routes/error"));         // <-------- Last!


module.exports = app;
