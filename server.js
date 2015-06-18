var express = require('express'),
	mongodb = require('mongodb'),
	bodyParser = require('body-parser'),
	async = require('async'),
	moment = require('moment'),
	uuid = require('uuid'),
	_ = require('underscore'),
	elasticsearch = require('elasticsearch')

var app = express()
app.use(bodyParser.json())
var jsonParser = bodyParser.json()
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/';
var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});



app.get('/', function (req, res) {
	res.send("yo mama so fat");

})

var getCurrentUser = function (name, cb) {
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
				getCurrentUser(req.body.username, function (err, doc, db, collection) {
					console.log("done");
					callback(err, doc, db, collection)
				})
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
					if(moment().unix() - doc[0].timestamp > 60) {
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
			console.log("\n\n")

			console.log(result);
			if(err) {
				console.log(err);
				res.status(403).send("duplicate")
			} else {
				client.index({
					index: 'user',
					type: 'document',
					id: result._id.toString(),
					body: {
						username: result.username,
						timestamp: result.timestamp,
					}
				}, function (error, response) {
					console.log(error);
					console.log(response);
				});
				res.send(result)
			}
		});
})

app.get("/user/query/:user", function (req, res) {
	var name = req.params.user;
	console.log(name)
	client.search({
		index: 'user',
		type: 'document',
		analyzeWildcard: true,
		body: {
			query: {
				match: {
					username:{
						query:name,
						fuzziness:"2",
						prefix_length:"1"
					}
				}
			}
		}
	}).then(function (resp) {
		var hits = resp.hits.hits;
		res.send(hits);
	}, function (err) {
		console.trace(err.message);
	});

})





app.post("/user/:user", function (req, res) {
	var username = req.params.user
	var session = req.body.session
	async.waterfall([
		function (callback) {
			getCurrentUser(username, function (err, doc, db, collection) {
				console.log("done");
				callback(err, doc, db, collection)
			})
		},
		function (doc, db, collection, callback) {
			if(_.isEmpty(doc) == false) {
				if(doc[0].session == session && moment().unix() - doc[0].timestamp < 60) {
					res.status(200).send({
						"status": "continue"
					})
					db.close()
				} else {
					res.status(403).send({
						"done": "failed"
					})
					db.close()
				}
			}

		}
	])
})
2

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});
