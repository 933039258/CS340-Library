module.exports = function(){
    var express = require('express');
    var router = express.Router();
    function getCheck(res, mysql, context, complete){
        mysql.pool.query("SELECT b.id, b.title, a.name AS author, g.name AS genre, b.isbn FROM books b INNER JOIN books_authors ba ON (b.isbn = ba.isbn) INNER JOIN authors a ON (ba.author_id = a.id) INNER JOIN books_genres bg ON (b.isbn = bg.isbn) INNER JOIN genres g ON (bg.genre_id = g.id) INNER JOIN rentals r ON (r.book_id = b.id) WHERE (r.date_out IS NOT NULL)", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            console.log(results);
            context.rental = results;
            complete();
        });
    }





    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        
        var mysql = req.app.get('mysql');
        getCheck(res, mysql, context, complete); 
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('rental', context);
            }

        }
    });

 
      return router;
}();
