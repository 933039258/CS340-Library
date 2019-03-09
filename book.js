module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var createSqlHelper = require('./utils/mysql');

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

    function getBook(res, mysql, context, complete, isbn){
        var sql = 'SELECT  b.id, b.title, a.name AS author, g.name AS genre, b.isbn FROM books b LEFT JOIN books_authors ba ON (b.isbn = ba.isbn) LEFT JOIN authors a ON (ba.author_id = a.id) LEFT JOIN books_genres bg ON (b.isbn = bg.isbn) LEFT JOIN genres g ON (bg.genre_id = g.id)';
        if(isbn){
            sql += ' WHERE b.isbn=?';
        }
        mysql.pool.query(sql, isbn ? [isbn] : [], function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // format result set to support multi authors/genres
            var resultSet = {};
            results.forEach(function (r) {
                if(!resultSet[r.id]){
                    resultSet[r.id] = {
                        id: r.id,
                        title: r.title,
                        isbn: r.isbn,
                        authors: [],
                        genres: [],
                    };
                }
                r.author && !~resultSet[r.id].authors.indexOf(r.author) && resultSet[r.id].authors.push(r.author);
                r.genre && !~resultSet[r.id].genres.indexOf(r.genre) && resultSet[r.id].genres.push(r.genre);
            });
            var formattedResults = [];
            for(var k in resultSet) {
                if(resultSet.hasOwnProperty(k)) {
                    formattedResults.push(resultSet[k]);
                }
            }
            // console.log('book formatted', formattedResults);
            context.books = formattedResults;
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



    router.get('/detail/:isbn', async function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = [];
        var mysql = req.app.get('mysql');
        getBook(res, mysql, context, complete, req.params.isbn);

        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                context.book = context.books[0];
                delete context.books;
                res.render('bookdetail', context);
            }

        }
    });


    router.post('/', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);
        var isbn = req.body.isbn;
        var title = req.body.btitle;
        var anames = req.body.aname || [];
        var gnames = req.body.gname || [];

        try{
            // if the book exists
            var bookResult = await sh.select(
                'SELECT id FROM books WHERE isbn=?',
                [isbn]
            );
            if(bookResult.length) {
                throw new Error(`The book with ISBN "${isbn}" exists`);
            }
            // add book
            await sh.insert(
                'INSERT INTO books (isbn, title) VALUES (?,?)',
                [isbn, title]
            );

            // add authors
            for(var aname of anames) {
                if(!aname){
                    continue;
                }
                // if the author exists
                var authorResult = await sh.select(
                    'SELECT id FROM authors WHERE name=?',
                    [aname]
                );
                var authorId = 0;
                if(authorResult.length){
                    authorId = authorResult[0].id
                }else{
                    // add new author
                    var authorResult1 = await sh.insert(
                        'INSERT INTO authors (name) VALUES (?)',
                        [aname]
                    );
                    authorId = authorResult1.insertId;
                }
                await sh.insert(
                    'INSERT INTO books_authors (isbn, author_id) VALUES (?,?)',
                    [req.body.isbn, authorId]
                );
            }

            // add genres
            for(var gname of gnames) {
                if(!gname){
                    continue;
                }
                // if the genre exists
                var genreResult = await sh.select(
                    'SELECT id FROM genres WHERE name=?',
                    [gname]
                );
                var genreId = 0;
                if(genreResult.length){
                    genreId = genreResult[0].id
                }else{
                    // add new genre
                    var genreResult1 = await sh.insert(
                        'INSERT INTO genres (name) VALUES (?)',
                        [gname]
                    );
                    genreId = genreResult1.insertId;
                }
                await sh.insert(
                    'INSERT INTO books_genres (isbn, genre_id) VALUES (?,?)',
                    [req.body.isbn, genreId]
                );
            }

            res.redirect('/book');
        }catch (error){
            res.write(JSON.stringify(error.toString()));
            res.end();
        }
    });

    router.post('/detail/:isbn', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);
        var isbn = req.params.isbn;
        var title = req.body.btitle;
        var anames = req.body.aname || [];
        var gnames = req.body.gname || [];

        try{
            // if the book exists
            var bookResult = await sh.select(
                'SELECT id FROM books WHERE isbn=?',
                [isbn]
            );
            if(!bookResult.length) {
                throw new Error(`The book with ISBN "${isbn}" does not exist`);
            }
            // modify book
            await sh.update(
                'UPDATE books SET title=? WHERE isbn=?',
                [title, isbn]
            );

            // delete authors and re-add
            await sh.delete('DELETE FROM books_authors WHERE isbn=?', [isbn]);
            for(var aname of anames) {
                if(!aname){
                    continue;
                }
                // if the author exists
                var authorResult = await sh.select(
                    'SELECT id FROM authors WHERE name=?',
                    [aname]
                );
                var authorId = 0;
                if(authorResult.length){
                    authorId = authorResult[0].id
                }else{
                    // add new author
                    var authorResult1 = await sh.insert(
                        'INSERT INTO authors (name) VALUES (?)',
                        [aname]
                    );
                    authorId = authorResult1.insertId;
                }
                await sh.insert(
                    'INSERT INTO books_authors (isbn, author_id) VALUES (?,?)',
                    [isbn, authorId]
                );
            }

            // delete genres and re-add
            await sh.delete('DELETE FROM books_genres WHERE isbn=?', [isbn]);
            for(var gname of gnames) {
                if(!gname){
                    continue;
                }
                // if the genre exists
                var genreResult = await sh.select(
                    'SELECT id FROM genres WHERE name=?',
                    [gname]
                );
                var genreId = 0;
                if(genreResult.length){
                    genreId = genreResult[0].id
                }else{
                    // add new genre
                    var genreResult1 = await sh.insert(
                        'INSERT INTO genres (name) VALUES (?)',
                        [gname]
                    );
                    genreId = genreResult1.insertId;
                }
                await sh.insert(
                    'INSERT INTO books_genres (isbn, genre_id) VALUES (?,?)',
                    [isbn, genreId]
                );
            }

            res.redirect(`/book/detail/${isbn}`);
        }catch (error){
            res.write(JSON.stringify(error.toString()));
            res.end();
        }
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



    router.post('/delete_book', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);
        var isbn = [req.body.bookid];

        try{
            // delete book authors, genres and rentals
            await sh.delete('DELETE FROM books_authors WHERE isbn=(SELECT isbn from books WHERE id = ? LIMIT 1)', [isbn]);
            await sh.delete('DELETE FROM books_genres WHERE isbn=(SELECT isbn from books WHERE id = ? LIMIT 1)', [isbn]);
            await sh.delete('DELETE FROM rentals WHERE book_id=(SELECT id from books WHERE id=? LIMIT 1)', [isbn]);
            // delete book
            await sh.delete('DELETE FROM books WHERE id=?', [isbn]);

            res.redirect('/book');
        }catch(error){
            res.write(JSON.stringify(error.toString()));
            res.status(400);
            res.end();
        }
    });

    router.post('/insert_author', async function(req, res){
        console.log('insert_author..');
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);

        var aname = req.body.aname;
        var isbn = req.body.isbn;
        try{
            // if the author exists
            var result = await sh.select(
                'SELECT id FROM authors WHERE name=?',
                [aname]
            );
            var authorId = 0;
            if(result.length){
                authorId = result[0].id
            }else{
                // add new author
                var result1 = await sh.insert(
                    'INSERT INTO authors (name) VALUES (?)',
                    [aname]
                );
                authorId = result1.insertId;
            }
            await sh.insert(
                'INSERT INTO books_authors (isbn, author_id) VALUES (?,?)',
                [isbn, authorId]
            );
            res.redirect('/book');
        }catch(error){
            res.write(JSON.stringify(error.toString()));
            res.status(400);
            res.end();
        }
    });

    return router;
}();
