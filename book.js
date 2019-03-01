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
            context.genres = results;
            complete();
        });
    }

    function getBook(res, mysql, context, complete){
        
        mysql.pool.query("SELECT  b.id, b.title, a.name AS author, g.name AS genre, b.isbn FROM books b LEFT JOIN books_authors ba ON (b.isbn = ba.isbn) LEFT JOIN authors a ON (ba.author_id = a.id) LEFT JOIN books_genres bg ON (b.isbn = bg.isbn) LEFT JOIN genres g ON (bg.genre_id = g.id)", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            console.log(results);
            context.books = results;
            complete();
        });
    }


    

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



    router.get('/:id', function(req, res){
        console.log("123");
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedbooks.js", "updatebook.js"];
        var mysql = req.app.get('mysql');
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-book', context);
            }

        }
    });


    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql0 = "INSERT INTO authors (name) VALUES (?)";
        var inserts0 = [req.body.author];
        mysql.pool.query(sql0, inserts0, function(error, results1, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                var sql = "INSERT INTO books (isbn, title) VALUES (?,?)";
                var inserts = [req.body.isbn, req.body.btitle];
                sql = mysql.pool.query(sql,inserts,function(error, results2, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                });

                var sql2 = "INSERT INTO books_authors (isbn, author_id) VALUES (?,?)";
                var inserts2 = [req.body.isbn, results1.insertId];
                sql2 = mysql.pool.query(sql2,inserts2,function(error, results3, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }else{
                        res.redirect('/book');
                    }
                });
            }

        });
        
    });

    
   router.put('/:id', function(req, res){
       console.log("13213213");
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

  

    router.post('/delete_book', function(req, res){
        console.log('delete..');
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM books_authors WHERE isbn = ?";
        var inserts = [req.body.bookid];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                var sql = "DELETE FROM books WHERE isbn = ?";
                var inserts = [req.body.bookid];
                sql = mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.status(400);
                        res.end();
                    }else{
                       
                        res.redirect('/book');
                    }
                })
            }
        })

        
    });

    router.post('/insert_author', function(req, res){
        console.log('insert_author..');
        var mysql = req.app.get('mysql');
        var sql0 = "INSERT INTO authors (name) VALUES (?)";
        var inserts0 = [req.body.aname];
        sql0 = mysql.pool.query(sql0, inserts0, function(error, results0, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                var sql = "INSERT INTO books_authors (isbn, author_id) VALUES (?,?)";
                var inserts = [req.body.bookid, results0.insertId];
                sql = mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.status(400);
                        res.end();
                    }else{
                        res.redirect('/book');
                    }
                })
            }
        })

        
    });

    return router;
}();
