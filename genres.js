module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var createSqlHelper = require('./utils/mysql');

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

        mysql.pool.query("SELECT g.id, g.name, b.title AS title, b.isbn AS isbn FROM genres g  LEFT JOIN books_genres bg ON (g.id= bg.genre_id) LEFT JOIN books b ON(bg.isbn=b.isbn) ORDER BY g.id"
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

    router.post('/insert_genre', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);

        var gnames = req.body.gname || [];
        var isbn = req.body.isbn;
        try{
            for(var gname of gnames){
                if (!gname){
                    continue;
                }
                // if the genres exists
                var result = await sh.select(
                    'SELECT id FROM genres WHERE name=?',
                    [gname]
                );
                var genreId = 0;
                if(result.length){
                    genreId = result[0].id
                }else{
                    // add new genres
                    var result1 = await sh.insert(
                        'INSERT INTO genres (name) VALUES (?)',
                        [gname]
                    );
                    genreId = result1.insertId;
                }
                await sh.insert(
                    'INSERT INTO books_genres (isbn, genre_id) VALUES (?,?)',
                    [isbn, genreId]
                );
            }

            res.redirect('/genres');
        }catch(error){
            res.write(JSON.stringify(error.toString()));
            res.status(400);
            res.end();
        }
    });

    router.post('/delete_genre', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);

        var gname = req.body.gname;
        try{
            await sh.select(
                'DELETE FROM books_genres WHERE genre_id=(SELECT id from genres WHERE name=? LIMIT 1)',
                [gname]
            );
            await sh.select(
                'DELETE FROM genres WHERE name=?',
                [gname]
            );

            res.redirect('/genres');
        }catch(error){
            res.write(JSON.stringify(error.toString()));
            res.status(400);
            res.end();
        }
    });



    return router;
}();
