'use strict';
var path = require('path');
var pgp = require('pg-promise')();
var db = pgp(process.env.DATABASE_URL);


function listAll(req, res, next){

  db.any(
    `SELECT recipes.id AS id, recipes.title AS title, users.username AS user,
    ARRAY_AGG(categories.category) as categories FROM
    recipes LEFT JOIN users ON
    recipes.user_id = users.id
    LEFT JOIN categories_recipes_xref AS crx ON
    recipes.id = crx.recipe_id
    LEFT JOIN categories ON
    categories.id = crx.category_id
    WHERE recipes.is_shown
    GROUP BY recipes.id, recipes.title, users.username;`).
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
