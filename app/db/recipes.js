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


function addRecipe(req, res, next){
  var title = req.body.title;
  var user_id = parseInt(req.body.user_id); // TODO get from session
  var directions = req.body.directions;
  String.prototype.join = function(){return this;};
  var ingredients = req.body.ingredient.join(', ');
  var categories = req.body.category.join(', ');

  var ingredient_ids;
  var recipe_id;
  // Insert ingredients into ingredients and get ids
  db.any(`INSERT INTO ingredients (ingredient) SELECT x FROM UNNEST(ARRAY[$1]) AS x RETURNING id;`,
  ingredients).
    then(function(results){
      ingredient_ids = results.map(el => el.id).join(', ');
      // Insert recipe into recipes and get id
      db.one(`INSERT INTO recipes (title, directions, user_id) VALUES ($1, $2, $3) RETURNING id;`,
      [req.body.title, req.body.directions, req.body.user_id]).
        then(function(results){
          recipe_id = results.id;
          res.recipe_id = recipe_id;
          // Insert category_ids and recipe_ids into categories_recipes_xref
          // Must have one or more categories
          db.none(`INSERT INTO categories_recipes_xref (recipe_id, category_id)
          SELECT $1, x FROM UNNEST(ARRAY[$2^]) AS x;`, [recipe_id, categories]). // TODO fix raw input
            then(function(){
              // Insert ingredient_ids and recipe_ids into ingredients_recipes_xref
              // Must have one or more ingredients
              db.none(`INSERT INTO ingredients_recipes_xref (recipe_id, ingredient_id)
              SELECT $1, x FROM UNNEST(ARRAY[$2^]) AS x;`, [recipe_id, ingredient_ids]).
              then(function(){
                next();
              }).
              catch(function(error){
                console.log(error);
                res.status(500).send('There was a problem retrieving the data from server');
              });
            }).
            catch(function(error){
              console.log(error);
              res.status(500).send('There was a problem retrieving the data from server');
            });
        }).
        catch(function(error){
          console.log(error);
          res.status(500).send('There was a problem retrieving the data from server');
        });
    }).
    catch(function(error){
      console.log(error);
      res.status(500).send('There was a problem retrieving the data from server');
    });
}

function deleteRecipe(req, res, next){
  var recipe_id = parseInt(req.params.id);
  // Set isShown on recipe to false
  db.none('UPDATE recipes SET is_shown = false WHERE id = $1',
  recipe_id).
    then(function(){
      // Delete categories_recipes_xref
      db.none('DELETE FROM categories_recipes_xref WHERE recipe_id = $1',
      recipe_id).
        then(function(){
          // Delete ingredients_recipes_xref
          db.none('DELETE FROM ingredients_recipes_xref WHERE recipe_id = $1',
          recipe_id).
            then(function(){
              next();
            }).
            catch(function(error){
              console.log(error);
              res.status(500).send('There was a problem retrieving the data from server');
            });
      }).
      catch(function(error){
        console.log(error);
        res.status(500).send('There was a problem retrieving the data from server');
      });
    })
    .catch(function(error){
      console.log(error);
      res.status(500).send('There was a problem retrieving the data from server');
    });
}


module.exports = {
  listAll: listAll,
  showRecipe: showRecipe,
  addRecipe: addRecipe,
  deleteRecipe: deleteRecipe
};
