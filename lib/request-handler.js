var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() { 
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Link.find(function(err, links) {
    if (err) return console.error(err);
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  db.Link.findOne({ url: uri }, function(err, found) {
    if (err) return console.error(err);
    if (found) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = new db.Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        newLink.setCode();
        newLink.save(function(err, newLink) {
          if (err) return console.error(err);
          res.send(200, newLink);
          console.log('New link saved!');
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ username: username }, function(err, user) {
    if (err) return console.error(err);

    if (!user) {
      console.log("User not found!");
      res.redirect('/login');
    } else {
        user.comparePassword(password, function(match) {
          if (match) {
            console.log("Match found!");
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.User.findOne({ username: username }, function(err, user) {
    if (err) return console.error(err);
    if (!user) {
      var newUser = new db.User({
        username: username,
        password: password
      });
      newUser.hashPassword(function (hashedUser) {
        hashedUser.save(function(err, hashedUser) {
          if (err) {
            console.log('Account already exists');
            res.redirect('/signup');
          }
          else {
            console.log('New user saved!');
            util.createSession(req, res, hashedUser);        
          }
        });
      });
    }
  });
};

exports.navToLink = function(req, res) {
  db.Link.findOne({ code: req.params[0] }, function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err, link) {
        return res.redirect(link.url);
      });
    }
  });
};