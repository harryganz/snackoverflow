'use strict';
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

// Configure application
var app = express();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// App wide middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Dynamic Routes

// Static Routes
app.use(express.static(path.join(__dirname, '/public')));


// Start server
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Listening on port ', port);
});
