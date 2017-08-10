const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const Senator = require('./models/senators');
const mustacheExpress = require('mustache-express');
const app = express();

// Connect templating engine to app instance
app.engine('mustache', mustacheExpress());
// Connect views folder to views name in app instance
app.set('views', __dirname + './views');
// Connect view engine to mustache
app.set('view engine', 'mustache');

// Configure Body Parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());

// run this command at the terminal to import the senator data into Mongo
// mongoimport --db senatorsdb --collection senators --file senators.json
var url = 'mongodb://localhost:27017/senatorsdb';

// Allows public folder to be served statically to browsers
app.use(express.static('public'));

app.get('/', function(req, res) {
  // render a page template called index and pass an object
  mongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Error connecting to Mongo DB: ' + err);
    } else {
      findAllSenators(db, function(results) {
        res.render('index', {
          senators: results
        });
      });
    }
  });
});

app.get('/add_senator', function(req, res) {
  mongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Error connecting to Mongo DB: ' + err);
    } else {
      findLargestId(db, function(id) {
        res.render('add_senator', {
          'newId': id + 1
        });
      });
    }
  });
});

app.post('/add_senator', function(req, res) {
  mongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Error connecting to Mongo DB: ' + err);
    } else {
      db.collection('senators').insertOne({
        "id": req.body.id,
        "party": req.body.party,
        "state": req.body.state,
        "person": {
          "gender": req.body.gender,
          "firstname": req.body.name.split(" ")[0],
          "lastname": req.body.name.split(" ")[1],
          "birthday": req.body.birthdate
        },
      });
      findAllSenators(db, function(results) {
        res.render('index', {
          senators: results
        });
      });
    }
  });
});

app.get('/:id', function(req, res) {
  mongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Error connecting to Mongo DB: ' + err);
    } else {
      findSpecificSenator(db, parseInt(req.params.id), function(foundSenator) {
        res.render('specific_senator', {
          senator: foundSenator
        });
      });
    }
  })
});

app.post('/:id', function(req, res) {
  mongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Error connecting to Mongo DB: ' + err);
    } else {
      deleteSpecificSenator(db, parseInt(req.params.id), function(success) {
        if (success) {
          console.log('successful deletion!');
          res.redirect('/');
        } else {
          console.log('Delete unsuccessful');
        }
      })
    }
  });
});

app.listen(3000, function() {
  console.log('Successfully started express application!');
});
