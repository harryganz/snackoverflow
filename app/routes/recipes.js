'use strict';
var path = require('path');
var Recipe = require(path.join(__dirname, '../db/recipes'));
var Category = require(path.join(__dirname, '../db/categories'));
var recipes = require('express').Router();

recipes.get('/', Recipe.listAll, function(req, res){
  res.render('recipes/list', {
    page_title: 'Recipes',
    stylesheets: ['list'],
    recipes: res.data
  });
});



recipes.get('/new', Category.listAll, function(req, res){
  res.render('recipes/new', {
    page_title: 'Add Recipe',
    formAction: '/recipes',
    formMethod: 'post',
    categories: res.categories
  });
});

recipes.get('/:id/edit', Category.listAll, Recipe.showRecipe, function(req, res){
  res.render('recipes/edit', {
    page_title: 'Edit Recipe',
    formAction: '/recipes/'+req.params.id +'?_method=PUT',
    formMethod: 'post',
    categories: res.categories,
    recipe: res.data
  });
});

recipes.get('/:id', Recipe.showRecipe, function(req, res){
  res.render('recipes/show', {
    page_title: 'Show Recipe',
    recipe: res.data
  });
});

recipes.post('/', Recipe.addRecipe, function(req, res){
  res.redirect('/recipes/'+res.recipe_id);
});

recipes.delete('/:id', Recipe.deleteRecipe, function(req, res){
  res.redirect(303,'/recipes');
});

recipes.put('/:id', Recipe.updateRecipe, function(req, res){
  res.redirect(303, '/recipes/'+req.params.id);
});

module.exports = recipes;
