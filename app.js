var createError = require('http-errors');
var express = require('express');
var moment = require('moment');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket = require('socket.io');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mysql = require("mysql");
var app = express();
let abandono;
let efetuada;
let recebidas;
let espera;
let TMA;

var con = mysql.createConnection({
  host: "10.22.1.55",
  user: "callcenter",
  password: "c4lLc3nTer",
  database: "callcenter"
});
// isso vai sair daquinoo

function queryLigacoesRecebidas() {
  con.query("SELECT count(*) as total FROM cdr WHERE lastdata='SURA_TI' AND disposition='ANSWERED' AND (dstchannel IS NOT NULL) AND start >= CURDATE()", function (err, rows) {
    if (err) throw err;
 recebidas = rows[0];
  
  });
}

function queryTempoLigacao() {
  con.query("SELECT SEC_TO_TIME(AVG(timediff(c.eventtime, c1.eventtime))) as tempo FROM cel c INNER JOIN cel c1 ON c.uniqueid = c1.uniqueid WHERE c.eventtype = 'BRIDGE_ENTER' AND c1.eventtype = 'ANSWER' AND c.appname = 'Queue' AND c1.appname = 'ANSWER' AND c.eventtime >= CURDATE()    AND c.context='urasura' ", function (err, rows) {
    if (err) throw err;
    espera=rows[0];
    
  });
}

function queryLigacoeEfetuadas() {
  con.query("SELECT count(*)as total FROM callcenter.cdr where start >= curdate() and (dst REGEXP '^[0-9]+$') and (src like '119%' or dcontext = 'urasura')", function (err, rows) {
    if (err) throw err;
    efetuada = rows[0];
  });
}

function queryAbandono() {
  con.query("SELECT count(*) as total FROM callcenter.queue_log where queuename='SURA_TI' and datahora >= curdate() and event = 'ABANDON' and data3 >=45", function (err, rows) {
    if (err) throw err;
    abandono = rows[0];
  });
}

function queryTMALigacao() {
  con.query("select SEC_TO_TIME(AVG(billsec)) as tempo from cdr where lastdata='SURA_TI' and disposition='ANSWERED' AND (dstchannel is not null) and start >= CURDATE()", function (err, rows) {
    if (err) throw err;
    TMA = rows[0];
  });
}

var server = app.listen(4000, function () {
  console.log('Listening for requests on port 4000');
});
//Socket setup
var io = socket(server);

io.on('connection', function (socket) {
  console.log('made socket connection', socket.id);
  queryAbandono();
  queryLigacoesRecebidas();
  queryTempoLigacao();
  queryLigacoeEfetuadas();
  queryTMALigacao();

  socket.on('dashboard', function (data) {
    socket.nome = 'dashboard'
    if(espera){
      if(espera.tempo === null){
        espera.tempo ="00:00:00";
      }
    }
  if(TMA){
    if(TMA.tempo === null){
      TMA.tempo ="00:00:00";
    }
  }
    io.to(socket.id).emit('dashboard', {
      tempoFront:espera,
      recebidasFront: recebidas,
      efetuadasFront:efetuada,
      abandonoFront:abandono,
      tma:TMA
    });
  });
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
