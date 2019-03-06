module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var createSqlHelper = require('./utils/mysql');

    function getCheck(res, mysql, context, complete){
        mysql.pool.query("SELECT b.id, b.title, a.name AS author, g.name AS genre, b.isbn FROM books b LEFT JOIN books_authors ba ON (b.isbn = ba.isbn) LEFT JOIN authors a ON (ba.author_id = a.id) LEFT JOIN books_genres bg ON (b.isbn = bg.isbn) LEFT JOIN genres g ON (bg.genre_id = g.id) LEFT JOIN rentals r ON (r.book_id = b.id) WHERE (r.date_out IS NOT NULL) AND (r.date_in IS NULL)", function(error, results, fields){
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
            console.log('rental formatted', formattedResults);
            context.rental = formattedResults;
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

    router.post('/out', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);
        var userId = req.body.userid;
        var bookId = req.body.bookid;
        var time = req.body.rtime;

        try{
            // check if the book is available
            const bookResult = await sh.select(
                'SELECT id FROM rentals WHERE book_id=? AND date_out IS NOT NULL AND date_in IS NULL',
                [bookId]
            );
            if(bookResult.length){
              throw new Error('The book is unavailable');
            }
            await sh.insert(
                'INSERT INTO rentals (book_id, user_id, date_out) VALUES (?, ?, ?)',
                [bookId, userId, new Date(time)]
            );

            res.redirect('/rental');
        }catch(error){
            res.write(JSON.stringify('Add rental failed. ' + error.toString()));
            res.status(400);
            res.end();
        }
    });

    router.post('/in', async function(req, res){
        var mysql = req.app.get('mysql');
        var sh = createSqlHelper(mysql.pool);
        var bookId = req.body.bookid;
        var time = req.body.rtime;

        try{
            // check if the rental is available
            const rentalResult = await sh.select(
                'SELECT id FROM rentals WHERE book_id=? AND date_out IS NOT NULL AND date_in IS NULL',
                [bookId]
            );
            if(!rentalResult.length){
                throw new Error('The rental is invalid');
            }
            await sh.insert(
                'UPDATE rentals SET date_in=? WHERE id=?',
                [new Date(time), rentalResult[0].id]
            );

            res.redirect('/rental');
        }catch(error){
            res.write(JSON.stringify('Modify rental failed. ' + error.toString()));
            res.status(400);
            res.end();
        }
    });


    return router;
}();
