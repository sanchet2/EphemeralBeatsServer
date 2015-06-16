var express = require('express')
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');
var uuid = require('uuid');
var moment = require('moment');
moment().format();
var url = 'mongodb://localhost:27017/';

var app = express();
app.use(bodyParser.json())
var jsonParser = bodyParser.json()

app.get('/', function (req, res) {
	res.send("yo mama so fat")

});


app.post('/username', function (req, res) {
	//connect to database

	MongoClient.connect(url, function (err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server")

		var collection = db.collection('log1');
		req.body.uuid = uuid.v1()

		var options = {
			"limit": 1,
			"sort": "_id"
		}
		var query = {
			"username": req.body.username
		}
		collection.find(query, options).toArray(function (err, item) {
			console.log("running request");
			if(err)
				res.send(err);
			else if(item != null) {
				//change to item value
				if(moment().unix() - req.body.timestamp > 60) {
					//create user with new uuid and timestamp
					req.body.timestamp = moment().unix();
					collection.insert(req.body, function (err, result) {
						if(err) {
							console.log(err)
						} else {
							res.send(req.body)
						}
						db.close();
					});

				} else {
					res.send("wont work");
				}
			} else {
				collection.insert(req.body, function (err, result) {
					if(err) {
						console.log(err)
					} else {
						res.send(req.body)
					}
					db.close();
				});
			}
		});
	});
});


var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});
