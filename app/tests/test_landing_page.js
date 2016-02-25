var mocha = require('mocha');
var agent = require('supertest');
var path = require('path');
var app = require(path.join(__dirname, '../server'));

describe('GET /', function(){

  var route;
  beforeEach(function(done){
    route = agent(app).get('/');
    done();
  });

  it('returns a 200 status code', function(done){
    route.expect(200, done);
  });

  it('returns an HTML format', function(done){
    route.
      expect('Content-Type', /html/, done);
  });
});
