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



module.exports = {
  listAll: listAll
};
