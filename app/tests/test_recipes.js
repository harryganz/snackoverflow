var mocha = require('mocha');
var agent = require('supertest');
var path = require('path');
var app = require(path.join(__dirname, '../server'));

describe('GET /recipes', function(){
  var route;
  beforeEach(function(done){
    route = agent(app).get('/recipes');
    done();
  });

  it('returns a 200 status', function(done){
    route.
    expect(200, done);
  });

  it('Returns an html Content-Type', function(done){
    route.
    expect('Content-Type', /html/, done);
  });

  it('Returns a body with text matching "Title 1"', function(done){
    route.
    expect(/title 1/i, done);
  });
});
