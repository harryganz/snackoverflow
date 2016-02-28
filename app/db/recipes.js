'use strict';
var path = require('path');
var pgp = require('pg-promise')();
var db = pgp(process.env.DATABASE_URL);



function listAll(req, res, next){
  var categories = req.query.category;
  var query = `SELECT recipes.id AS id, recipes.title AS title,
  users.username AS user, ARRAY_AGG(categories.category) AS categories
      FROM (SELECT recipes.id AS recipeid FROM recipes
          INNER JOIN categories_recipes_xref AS crx ON
          crx.recipe_id = recipes.id
          INNER JOIN categories ON
          crx.category_id = categories.id
          ${categories ? 'AND categories.category IN ($1^)' : ''}
          GROUP BY recipeid) AS rcat
  INNER JOIN recipes ON
  recipes.id = rcat.recipeid
  INNER JOIN categories_recipes_xref AS crx ON
  crx.recipe_id = recipes.id
  INNER JOIN categories ON
  categories.id = crx.category_id
  INNER JOIN users ON
  recipes.user_id = users.id
  WHERE recipes.is_shown
  GROUP BY recipes.id, recipes.title, users.username;`;
  db.any(query, pgp.as.csv(categories)).
    then(function(results){
      res.data = results;
      next();
    }).
    catch(function(error){
      res.status(500).send('There was a problem retrieving the data from server');
      console.log('there was an error with the query ', error);
    });
}

function showRecipe(req, res, next){
  var query = `SELECT rcat.id AS id, rcat.title AS title,
  rcat.directions AS directions,
  rcat.user AS user, rcat.categories AS categories,
  ARRAY_AGG(ingredients.ingredient) AS ingredients
  FROM (SELECT recipes.id AS id, recipes.title AS title,
  recipes.directions AS directions, users.username AS user,
  ARRAY_AGG(categories.category) AS categories
  FROM recipes INNER JOIN users
  ON users.id = recipes.user_id
  INNER JOIN categories_recipes_xref AS crx
  ON crx.recipe_id = recipes.id
  INNER JOIN categories
  ON crx.category_id = categories.id
  WHERE recipes.id = $1 AND recipes.is_shown
  GROUP BY recipes.id, recipes.title, recipes.directions, users.username
) AS rcat
INNER JOIN ingredients_recipes_xref AS irx
ON rcat.id = irx.recipe_id
INNER JOIN ingredients
ON irx.ingredient_id = ingredients.id
GROUP BY rcat.id, rcat.title, rcat.directions, rcat.user, rcat.categories;`;

db.one(query, req.params.id).then(function(result){
  res.data = result;
  next();
}).catch(function(error){
  console.log(error);
  res.status(500).send('There was a problem retrieving the data from server');
});
}


module.exports = {
  listAll: listAll,
  showRecipe: showRecipe
};
