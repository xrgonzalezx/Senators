const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/tv');

const senatorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  faxnumber: {
    type: Number,
    required: true
  },
}, );

const Senator = mongoose.model('Senator', senatorSchema, 'usSenators');

var findAllSenators = function(db, callback) {
  var collection = db.collection('senators');
  collection.find().sort({
    "person.lastname": 1
  }).toArray(function(err, results) {
    callback(results);
  });
};

var findLargestId = function(db, callback) {
  var collection = db.collection('senators');
  collection.find().sort({
    id: -1
  }).toArray(function(err, results) {
    db.close();
    callback(parseInt(results[0].id));
  });
};

var findSpecificSenator = function(db, id, callback) {
  var collection = db.collection('senators');
  collection.findOne({
    "id": id
  }, function(err, doc) {
    db.close();
    if (err) {
      console.log('Error fetching specific senator with id: ' + id);
    } else {
      callback(doc);
    }
  });
};

var deleteSpecificSenator = function(db, id, callback) {
  var collection = db.collection('senators');
  collection.deleteOne({
    "id": id
  }).then(function(result) {
    db.close();
    if (result.deletedCount == 1) {
      callback(true);
    } else {
      callback(false);
    }
  }).catch(function(error) {
    console.log('Error deleting record');
  });
};

module.exports = Senator;
