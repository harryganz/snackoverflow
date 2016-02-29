var pgp = require('pg-promise')();
var db = pgp(process.env.DATABASE_URL);
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');

function loginUser(req, res, next){
  var username = req.body.username;
  var password = req.body.password;

  db.any('SELECT * FROM users WHERE username LIKE ($1);', [username]).
  then(function(results){
     if(results.length === 0){
       res.redirect('/users/login');
     } else if(bcrypt.compareSync(password, results[0].password_digest)){
       res.data = results[0];
       next();
     } else {
       res.redirect('/users/login');
     }
  }).catch(function(error){
    console.log('Error logging in ', error);
    res.status(500).send('there was an error logging in');
  });
}

function createSecure(username, email, password, callback){
  bcrypt.genSalt(function(err, salt){
    bcrypt.hash(password, salt, function(err, hash){
      if(err) throw err;
      callback(username, email, hash);
    });
  });
}

function createUser(req, res, next){
  createSecure(req.body.username, req.body.email, req.body.password, saveUser);

  function saveUser(username, email, hash) {
    db.none('INSERT INTO users (username, email, password_digest) VALUES ($1, $2, $3)',
    [username, email, hash])
    .then(function(results){
      next();
    }).catch(function(error){
      console.log('there was an error creating user ', error);
      res.status(500).send('there was an error creating user');
    });
  }
}

module.exports = {
  createUser: createUser,
  loginUser: loginUser
};
