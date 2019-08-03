var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter')
var promoRouter = require('./routes/promoRouter')
var leaderRouter = require('./routes/leaderRouter')

const mongoose = require('mongoose');
const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions');
const Leaders = require('./models/leaders');
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
app.use(cookieParser('12345-67890-09876-54321'));

// enough to implement basic Authentication within our application
function auth(req, res, next) {
  // console.log(req.headers);
  console.log(req.signedCookies)
  // if the signed cookie doesn’t contain the user property on it
  if (!req.signedCookies.user) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
    }
    // the buffer enables you to split the value and
    // we also get the encoding of the buffer which is Base64
    // we are looking for only the second element of this array
    // the split will cause the string to split into an array of 2 items
    // we are picking up the base 64 encoded string from that
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];

    if (user == 'admin' && pass == 'password') {
      // 'user' is the name, 'admin' is the value
      res.cookie('user', 'admin', { signed: true });
      next(); // authorized
      // from the auth, this request will passed on the next set of middleware
      // then Express will try to match the specific request to were
    } else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
    }
  }
  else {
    if (req.signedCookies.user === 'admin') {
      next();
    }
    else {
      var err = new Error('You are not authenticated!');
      err.status = 401;
      next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
