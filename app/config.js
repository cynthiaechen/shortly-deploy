// var Bookshelf = require('bookshelf');
var mongoose = require('mongoose');
var path = require('path');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

var db = mongoose.connection;

var urlsSchema = new mongoose.Schema({
  url: String
, base_url: String
, code: Number
, title: String
, visits: {type: Number, default: 0}
, code: String
, timestamps : { type : Date, default: Date.now }});

urlsSchema.methods.setCode: function(){  
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5));
};

var usersSchema = new mongoose.Schema({
username: String
, password: String
, timestamps : { type : Date, default: Date.now }});

usersSchema.methods.comparePassword: function(attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

usersSchema.methods.hashPassword: function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
    });
};

var Link = mongoose.model('Link', urlsSchema);

var User = mongoose.model('User', usersSchema);

 
db.on('error', console.error);

// db.once('open', function() {

// });

mongoose.connect('mongodb://localhost/test');

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

module.exports = db;

module.exports = Link;
module.exports = User;

