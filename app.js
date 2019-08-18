// importing node modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

// using express to route the pages
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter')
var promoRouter = require('./routes/promoRouter')
var leaderRouter = require('./routes/leaderRouter')

const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions');
const Leaders = require('./models/leaders');
// setting up the url to the db
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log("Connected correctly to the server");
}, (err) => { console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));

// setting up the session middleware with the various options
// my session middleware is all set up
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// enough to implement basic Authentication within our application
// Authentication function
function auth(req, res, next) {
  // console.log(req.headers);
  // console.log(req.signedCookies)
  console.log(req.session);
  // if the signed cookie doesn’t contain the user property on it
  if (!req.session.user) {
    var err = new Error('Dude You are not Authenticated!');
    // res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);
  }
  // the buffer enables you to split the value and
  // we also get the encoding of the buffer which is Base64
  // we are looking for only the second element of this array
  // the split will cause the string to split into an array of 2 items
  // we are picking up the base 64 encoded string from that
  // var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  // var user = auth[0];
  // var pass = auth[1];

  // if (user === 'admin' && pass === 'password') {
  // 'user' is the name, 'admin' is the value
  // res.cookie('user', 'admin', { signed: true });
  // req.session.user = 'admin';
  // next(); // authorized
  // from the auth, this request will passed on the next set of middleware
  // then Express will try to match the specific request to were
  //   } else {
  //     var err = new Error('You are not authenticated yet!');
  //     res.setHeader('WWW-Authenticate', 'Basic');
  //     err.status = 401;
  //     return next(err);
  //   }
  // }
  else {
    if (req.session.user === 'authenticated') {
      // console.log('req.session: ', req.session);
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 403;
      return next(err);
    }
  }
}

app.use(auth);

//  enables to server static data from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
