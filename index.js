var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', 8081);
app.set('mysql', mysql);

app.use('/book',require('./book.js'))
app.use('/users',require('./users.js'));
app.use('/genres',require('./genres.js'));
app.use('/rental',require('./rental.js'));

app.use(function(req,res){
res.render("index",{"title":"test","layout":"main"});
});

app.use(function(req,res){
res.status(404);
res.render('404');
});

app.use(function(err, req, res, next){
console.error(err.stack);
res.type('plain/text');
res.status(500);
res.render('500');
});

app.listen(app.get('port'), function(){
console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
