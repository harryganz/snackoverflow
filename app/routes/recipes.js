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

recipes.get('/:id', Recipe.showRecipe, function(req, res){
  res.render('recipes/show', {
    page_title: 'Show Recipe',
    recipe: res.data
  });
});

recipes.post('/', Recipe.addRecipe, function(req, res){
  res.send(201);
});

module.exports = recipes;
