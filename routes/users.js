'use strict';
var path = require('path');
var User = require(path.join(__dirname, '../db/users'));
var users = require('express').Router();

users.post('/', User.createUser, function(req, res){
  res.redirect('/users/login');
});

users.get('/new', function(req, res){
  res.render('users/signup', {
    page_title: 'Sign Up',
    categories: res.categories,
    user: req.session.user
  });
});

users.get('/login', function(req, res){
  res.render('users/login.ejs', {
    page_title: 'Login',
    categories: res.categories,
    user: req.session.user
  });
});

users.post('/login', User.loginUser, function(req, res){
  req.session.user = res.data;

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
