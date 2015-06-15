var helios = require('helios')
var express = require('express')
var bodyParser = require('body-parser');
var ref = new Firebase("https://dinosaur-facts.firebaseio.com/dinosaurs");


//Setup
var app = express();
app.use(bodyParser.json())
var jsonParser = bodyParser.json()
var queryBuilder = new helios.queryBuilder();
var solr_client = new helios.client({
  host: '104.236.188.213', // Insert your client host
  port: 8080,
  path: '/solr', // Insert your client solr path
  timeout: 1000 // Optional request timeout
});


app.post('/username',function(req,res){
  console.log(req.body.username);
  ref.equalTo(req.body.username).on("child_added", function(snapshot) {

  });



}





//Routes
app.get('/', function(req, res) {
  solr_client.select(queryBuilder.simpleQuery({
    op: 'OR',
    df: 'id',
    q: '*'
  }).toString(), function(err, r) {
    if (err) console.log(err);
    res.send(r); // yes, it returns in raw format, you need to JSON.parse it
  });

});

app.post('/', jsonParser, function(req, res) {
  // res.send( 'Got a POST request' );
  console.log(req.body.username);
  var solrdoc = new helios.document();
  solrdoc.addField('id', req.body.username);
  solrdoc.addField('title',req.body.username);
  solr_client.addDoc(solrdoc, true, function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.send('done');
    }
  });

});


var server = app.listen(3000, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
