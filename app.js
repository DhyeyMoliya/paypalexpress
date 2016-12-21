var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var routes = require('./routes.js');
var app = express();

/*try {
  var configJSON = fs.readFileSync(__dirname + "/config.json");
  var config = JSON.parse(configJSON.toString());
} catch (e) {
  console.error("File config.json not found or is invalid: " + e.message);
  process.exit(1);
}
routes.init(config);*/
app.set('port', (process.env.PORT || 5000));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.post('/create-payment', routes.create);
app.post('/execute-payment', routes.execute);
app.get('/success', routes.success);
app.get('/cancel-payment', routes.cancel);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : err;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
