module.exports = function(){
    var express = require('express');
    var router = express.Router();
    function getBooks(res, mysql, context, complete){
        mysql.pool.query("SELECT isbn, title FROM books", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.books  = results;
            complete();
        });
    }

    function getGenres(res, mysql, context, complete){
        
        mysql.pool.query("SELECT g.id, g.name, b.title AS title, b.isbn AS isbn FROM genres g  LEFT JOIN books_genres bg ON (g.id= bg.genre_id) LEFT JOIN books b ON(bg.isbn=b.isbn)"
, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            console.log(results);
            context.genres = results;
            complete();
        });
    }

  

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getGenres(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('genres', context);
            }

        }
    });


   router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE books_genres SET isbn=?,name=?,title=? WHERE id=?";
        var inserts = [req.body.gname, req.params.isbn];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });




    return router;
}();