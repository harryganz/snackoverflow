var pgp = require('pg-promise')();
var db = pgp(process.env.DATABASE_URL);

function listAll(req, res, next){
  db.any('SELECT id, category FROM categories;').
  then(function(results){
    res.categories = results;
    next();
  }).
  catch(function(error){
    console.log('there was an error querying data ', error);
    res.status(500).send('there was an error getting data from server');
  });
}

module.exports = {
  listAll: listAll
};
