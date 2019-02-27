module.exports = function(){
    var express = require('express');
    var router = express.Router();
    function getAuthors(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM authors", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.authors  = results;
            complete();
        });
    }

    function getGenres(res, mysql, context, id, complete){
        var sql = "SELECT id, name FROM genres WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres = results[0];
            complete();
        });
    }

    function getBook(res, mysql, context, complete){
        mysql.pool.query("SELECT b.id, b.title, a.name AS author, g.name AS genre, b.isbn FROM books b INNER JOIN books_authors ba ON (b.isbn = ba.isbn) INNER JOIN authors a ON (ba.author_id = a.id) INNER JOIN books_genres bg ON (b.isbn = bg.isbn) INNER JOIN genres g ON (bg.genre_id = g.id)", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.books = results;
            complete();
        });
    }


    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletebook.js"];
        var mysql = req.app.get('mysql');
        getBook(res, mysql, context, complete);
        getAuthors(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('book', context);
            }

        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedbooks.js", "updatebook.js"];
        var mysql = req.app.get('mysql');
        getPerson(res, mysql, context, req.params.id, complete);
        getPlanets(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-book', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO books (isbn, title, author) VALUES (?,?,?)";
        var inserts = [req.body.isbn, req.body.btitle, req.body.author];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/book');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

   router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE books SET isbn=?, title=?, author=?, genres=? WHERE id=?";
        var inserts = [req.body.isbn, req.body.title, req.body.author, req.body.genres, req.params.id];
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

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM books WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
