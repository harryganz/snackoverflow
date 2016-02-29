'use strict';
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var pg = require('pg');
var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);
var path = require('path');

// Development configuration
if(!process.env.NODE_ENV){
  require('dotenv').config();
}

// Configure application
var app = express();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// App wide middlewares
app.use(morgan('dev'));
app.use(session({
  store: new pgSession({
    pg : pg,
    conString : process.env.DATABASE_URL,
    tableName : 'session'
  }),
  secret : process.env.SESSION_SECRET,
  resave : false,
  cookie : { maxAge : 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Dynamic Routes
app.get('/', function(req, res){
  res.render('home/index', {page_title: 'Home'});
});
app.use('/recipes', require(path.join(__dirname, '/routes/recipes')));
app.use('/users', require(path.join(__dirname, '/routes/users')));
// Static Routes
app.use(express.static(path.join(__dirname, '/public')));


// Start server
var port = process.env.PORT || 3000;
if(!module.parent){ // Prevent in use warning when testing
  app.listen(port, function(){
    console.log('Listening on port ', port);
  });
}

// Export app
module.exports = app;
