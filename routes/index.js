var express = require('express');
var session = require('express-session')
var router = express.Router();
var app = express();

/* GET home page. */
router.get('/',loginrequired, function(req, res, next) {
  res.render('index');
});

function loginrequired(req, res, next){
  if(session && session.logado == true){
    next()
  }else{
    res.render('login',{status: ''});
  }
}

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/logoff', function(req, res, next) {
  session.logado = false;
  res.render('login',{status: ''});
});
router.post('/', function (req, res,next) {
  console.log(req.body)
 if(req.body.senha === '123456' && req.body.user === 'admin'){
  session.logado  =true
  console.log( session.logado);
 res.render('index');
 }else{
  res.render('login',{status:'Usuário ou senha incorreto'});
 }
});



module.exports = router;

