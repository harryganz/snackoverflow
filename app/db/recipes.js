'use strict';
var path = require('path');
var pgp = require('pg-promise')();
var db = pgp(process.env.DATABASE_URL);


function listAll(req, res, next){

  db.any(
    `SELECT recipes.id AS id, recipes.title AS title, users.username AS user FROM
    recipes LEFT JOIN users ON
    recipes.user_id = users.id
    WHERE recipes.is_shown;`).
    then(function(results){
      res.data = results;
      next();
    }).
    catch(function(error){
      res.status(500).send('Oops');
      console.log('there was an error with the query ', error);
    });
}



module.exports = {
  listAll: listAll
};
