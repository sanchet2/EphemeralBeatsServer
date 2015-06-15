var express = require('express')
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
var uuid = require('uuid');

var url = 'mongodb://localhost:27017/';

var app = express();
app.use(bodyParser.json())
var jsonParser = bodyParser.json()

app.get('/', function(req, res) {
  res.send('Hello World!');
});


app.post('/username', function(req, res) {
  //connect to database

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server")

    var collection = db.collection('beatport');

    req.body.uuid = uuid.v1();

    collection.insert(req.body, function(err, result) {
      if (err) {
        console.log(err)
      } else {
        res.send(req.body)
      }


      db.close();
    });

  });

});


var server = app.listen(3000, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
