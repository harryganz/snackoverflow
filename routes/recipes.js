'use strict';
var path = require('path');
var Recipe = require(path.join(__dirname, '../db/recipes'));
var recipes = require('express').Router();

function isLoggedIn(req, res, next){
  if(req.session.user){
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

recipes.get('/', Recipe.listAll, function(req, res){
  res.render('recipes/list', {
    page_title: 'Recipes',
    stylesheets: ['list'],
    recipes: res.data,
    categories: res.categories,
    user: req.session.user
  });
});



recipes.get('/new', isLoggedIn, function(req, res){
  res.render('recipes/new', {
    page_title: 'Add Recipe',
    stylesheets: ['form'],
    scripts: ['form'],
    formAction: '/recipes',
    formMethod: 'post',
    categories: res.categories,
    user: req.session.user
  });
});

recipes.get('/:id/edit', isLoggedIn, Recipe.isOwner, Recipe.showRecipe, function(req, res){
  res.render('recipes/edit', {
    page_title: 'Edit Recipe',
    stylesheets: ['form'],
    scripts: ['form'],
    formAction: '/recipes/'+req.params.id +'?_method=PUT',
    formMethod: 'post',
    categories: res.categories,
    user: req.session.user,
    recipe: res.data
  });
});

recipes.get('/:id', Recipe.showRecipe, function(req, res){
  res.render('recipes/show', {
    page_title: 'Show Recipe',
    recipe: res.data,
    categories: res.categories,
    user: req.session.user
  });
});

recipes.post('/', isLoggedIn, Recipe.addRecipe, function(req, res){
  res.redirect('/recipes/'+res.recipe_id);
});

recipes.delete('/:id', isLoggedIn, Recipe.isOwner, Recipe.deleteRecipe, function(req, res){
  res.redirect(303,'/recipes');
});

recipes.put('/:id', isLoggedIn, Recipe.isOwner, Recipe.updateRecipe, function(req, res){
  res.redirect(303, '/recipes/'+req.params.id);
});

module.exports = recipes;
