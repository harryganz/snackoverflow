'use strict';
var path = require('path');
var Recipe = require(path.join(__dirname, '../db/recipes'));
var recipes = require('express').Router();

var recipesListArray = [
  {
    id: 1,
    title: 'Title 1',
    user: 'johnny'
  },
  {
    id: 2,
    title: 'Title 2',
    user: 'jill',
  }
];

recipes.get('/', Recipe.listAll, function(req, res){
  res.render('recipes/list', {
    page_title: 'Recipes',
    stylesheets: ['list'],
    recipes: res.data
  });
});

module.exports = recipes;

function listRecipes(req, res, next){
  res.data = recipesListArray;
  next();
}
