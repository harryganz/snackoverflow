'use strict';
var path = require('path');
var Recipe = require(path.join(__dirname, '../db/recipes'));
var recipes = require('express').Router();

recipes.get('/', Recipe.listAll, function(req, res){
  res.render('recipes/list', {
    page_title: 'Recipes',
    stylesheets: ['list'],
    recipes: res.data
  });
});

module.exports = recipes;
