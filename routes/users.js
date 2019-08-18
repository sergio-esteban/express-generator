var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();

router.use(bodyParser.json());


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});
// to signup a new user /user/signup
router.post('/signup', (req, res, next) => {
  // the client will include json string with username and password properties
  User.findOne({ username: req.body.username })
    .then((user) => {
      // so you don't allow duplicate user for signing up
      if (user != null) {
        var err = new Error('User ' + req.body.username + ' already exists!')
        err.status = 403; //forbidden code
        next(err);
      }
      else {
        return User.create({
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json({ status: 'Registration Successful!', user: user })
    }, (err) => next(err))
    .catch((err) => next(err))
})
// to login a new user
router.post('/login', (req, res, next) => {
  // it means that the user has not yet authenticated himself.
  if (!req.session.user) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error('Dude You are not Authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];


    User.findOne({ username: username })
      .then((user) => {
        // which means tht we couldn't find a user with that particular username:
        if (user === null) {
          var err = new Error('User ' + username + 'does not exists!');
          err.status = 403; //forbidden code
          return next(err);
        }
        else if (user.password !== password) {
          var err = new Error('Your password is incorrect');
          err.status = 403;
          return next(err);
        }
        else if (user.username === 'username' && user.password === 'password') {
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain')
          res.end('You are authenticated')
        }
      })
      .catch((err) => next(err))
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain')
    res.end('You are already authenticated')
  }
})

// why we do a get on the logout rather than a post which we did in the login?
// in login you need to submit password and username for logout you simply logging out yourself from the system
// the server already is tracking you based upon your session id and inside that session cookie

router.get('/logout', (req, res) => {
  // session must exist
  if (req.session) {
    // the session is destroyed and the information is removed from the server side
    req.session.destroy();
    // we need a method of deleting the cookie that is stored on the client side
    // and also the client cannot be used in expired session to try to contact that server
    res.clearCookie('session-id') //the cookie name is session-id
    // redirected to the home page here
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403; //forbidden operation
    next(err);
  }
})


module.exports = router;
