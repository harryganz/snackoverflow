'use strict';
var path = require('path');
var User = require(path.join(__dirname, '../db/users'));
var users = require('express').Router();

users.post('/', User.createUser, function(req, res){
  res.redirect('/');
});

users.get('/new', function(req, res){
  res.render('users/signup', {
    page_title: 'Sign Up'
  });
});

users.get('/login', function(req, res){
  res.render('users/login.ejs', {
    page_title: 'Login'
  });
});

users.post('/login', User.loginUser, function(req, res){
  req.session.user = res.rows;

  req.session.save(function(){
    res.redirect('/');
  });
});

users.delete('/logout', function(req, res){
  req.session.destroy(function(err){
    res.redirect(303,'/');
  });
});

module.exports = users;
