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
      rcat.user AS user, rcat.user_id AS user_id, rcat.categories AS categories,
      ARRAY_AGG(ingredients.ingredient) AS ingredients
      FROM (SELECT recipes.id AS id, recipes.title AS title,
      recipes.directions AS directions, users.username AS user, recipes.user_id AS user_id,
      ARRAY_AGG(categories.category) AS categories
      FROM recipes INNER JOIN users
      ON users.id = recipes.user_id
      LEFT JOIN categories_recipes_xref AS crx
      ON crx.recipe_id = recipes.id
      LEFT JOIN categories
      ON crx.category_id = categories.id
      WHERE recipes.id = $1 AND recipes.is_shown
      GROUP BY recipes.id, recipes.title, recipes.directions, users.username, recipes.user_id
    ) AS rcat
    LEFT JOIN ingredients_recipes_xref AS irx
    ON rcat.id = irx.recipe_id
    LEFT JOIN ingredients
    ON irx.ingredient_id = ingredients.id
    GROUP BY rcat.id, rcat.title, rcat.directions, rcat.user, rcat.categories, rcat.user_id;`;

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
  var user_id = parseInt(req.session.user.id);
  var directions = req.body.directions;
  var ingredients = req.body.ingredient;
  var categories = req.body.category;

  var ingredient_ids;
  var recipe_id;
  // Insert ingredients into ingredients and get ids
  db.any(`INSERT INTO ingredients (ingredient) SELECT x FROM UNNEST(ARRAY[$1^]::text[]) AS x RETURNING id;`,
  pgp.as.csv(ingredients)).
    then(function(results){
      ingredient_ids = results.map(el => el.id);
      // Insert recipe into recipes and get id
      db.one(`INSERT INTO recipes (title, directions, user_id) VALUES ($1, $2, $3) RETURNING id;`,
      [title, directions, user_id]).
        then(function(results){
          recipe_id = results.id;
          res.recipe_id = recipe_id;
          // Insert category_ids and recipe_ids into categories_recipes_xref
          // Must have one or more categories
          db.none(`INSERT INTO categories_recipes_xref (recipe_id, category_id)
          SELECT $1, x FROM UNNEST(ARRAY[$2^]::int[]) AS x;`, [recipe_id, pgp.as.csv(categories)]). // TODO fix raw input
            then(function(){
              // Insert ingredient_ids and recipe_ids into ingredients_recipes_xref
              // Must have one or more ingredients
              db.none(`INSERT INTO ingredients_recipes_xref (recipe_id, ingredient_id)
              SELECT $1, x FROM UNNEST(ARRAY[$2^]::int[]) AS x;`, [recipe_id, pgp.as.csv(ingredient_ids)]).
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

function updateRecipe(req, res, next){
  var recipe_id = req.params.id;
  var title = req.body.title;
  var directions = req.body.directions;
  var ingredients = req.body.ingredient;
  var categories = req.body.category;
  // Update recipe title, directions
  db.none('UPDATE recipes SET title = $1, directions = $2 WHERE id = $3;',
    [title, directions, recipe_id]).
    then(function(){
      // Delete categories_recipes_xref
      db.none('DELETE FROM categories_recipes_xref WHERE recipe_id = $1', recipe_id).
        then(function(){
          // Add categories_recipes_xref
          db.none(`INSERT INTO categories_recipes_xref (recipe_id, category_id)
            SELECT $1, x FROM UNNEST(ARRAY[$2^]::int[]) AS x`,
            [recipe_id, pgp.as.csv(categories)]).
            then(function(){
              // Delete ingredients_recipes_xref
              db.none('DELETE FROM ingredients_recipes_xref WHERE recipe_id = $1',
               recipe_id).
               then(function(){
                 // Add ingredients and return ingredient_ids
                 db.any(`INSERT INTO ingredients (ingredient)
                  SELECT x FROM UNNEST(ARRAY[$1^]::text[]) AS x RETURNING id`,
                  pgp.as.csv(ingredients)).
                  then(function(results){
                    var ingredient_ids = results.map(el => el.id);
                    // Add ingredients_recipes_xref
                    db.none(`INSERT INTO ingredients_recipes_xref(recipe_id, ingredient_id)
                      SELECT $1, x FROM UNNEST(ARRAY[$2^]::int[]) AS x`,
                      [recipe_id, pgp.as.csv(ingredient_ids)]).
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

function isOwner(req, res, next){
  db.one('SELECT user_id FROM recipes WHERE id = $1', req.params.id).
  then(function(result){
    if(result.user_id === req.session.user.id){
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  }).
  catch(function(error){
    console.log('there was an error making a query ', error);
    res.send(500).send('there was an error getting data from the server');
  });
}

module.exports = {
  listAll: listAll,
  showRecipe: showRecipe,
  addRecipe: addRecipe,
  deleteRecipe: deleteRecipe,
  updateRecipe: updateRecipe,
  isOwner: isOwner
};
