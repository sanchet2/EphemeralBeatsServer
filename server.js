var express = require('express'),
	mongodb = require('mongodb'),
	bodyParser = require('body-parser'),
	async = require('async'),
	moment = require('moment'),
	uuid = require('uuid'),
	_ = require('underscore')

var app = express()
app.use(bodyParser.json())
var jsonParser = bodyParser.json()
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/';

app.get('/', function (req, res) {
	connectToMongo("yo",function(err,doc,db,collection){
    console.log("damn girl");
    res.send('Hello World!');
  })

})

var connectToMongo = function (name, cb) {
	async.waterfall([
			function (callback) {
				console.log("connect Mongo")
				MongoClient.connect(url, function (err, db) {
					callback(err, db)
				})
			},
			function (db, callback) {
				console.log('find')
				var collection = db.collection('login')
				var query = {
					"username": name
				}
				var cursor = collection.find(query);
				cursor.sort({
					timestamp: -1
				});
				cursor.limit(1);
				cursor.skip(0);
				var stuff;
				cursor.toArray(function (err, doc) {
					console.log("doc");
					console.log(doc);
					callback(err, doc, db, collection);
				});
			}
		],
		function (err, doc, db, collection) {
			cb(err, doc, db, collection);
		})
}

app.post('/user', function (req, res) {
	console.log(req.body);
	async.waterfall([
			function (callback) {
				console.log("connect Mongo")
				MongoClient.connect(url, function (err, db) {
					callback(err, db)
				})
			},
			function (db, callback) {
				console.log('find')
				var collection = db.collection('login')
				var query = {
					"username": req.body.username
				}

				var cursor = collection.find(query);
				cursor.sort({
					timestamp: -1
				});
				cursor.limit(1);
				cursor.skip(0);
				var stuff;
				cursor.toArray(function (err, doc) {
					console.log("doc");
					console.log(doc);
					callback(err, doc, db, collection);
				});
			},
			function (doc, db, collection, callback) {
				if(_.isEmpty(doc)) {
					req.body.timestamp = moment().unix()
					req.body.session = uuid.v1();
					collection.insert(req.body, function (err, result) {
						db.close;
						callback(null, result.ops[0])
					})

				} else {
					//add logic for timestamp
					if(moment().unix() - doc[0].timestamp > 60 * 60 * 24) {
						req.body.timestamp = moment().unix()
						req.body.session = uuid.v1();
						collection.insert(req.body, function (err, result) {
							db.close;
							callback(null, result.ops[0])
						})
					} else {
						callback("Failed", null)
					}
				}
			}
		],
		function (err, result) {
			if(err) {
				console.log(err);
				res.status(403).send("duplicate")
			} else {
				res.send(result)
			}
		});

})








var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});
