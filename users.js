module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getUsers(res, mysql, context, complete){
        mysql.pool.query("SELECT id, fname, lname, join_date FROM users", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
	    console.log(results);
            context.users  = results;
            complete();
        });
    }



    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteuser.js"];
        var mysql = req.app.get('mysql');
        getUsers(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('users', context);
            }

        }
    });




  router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO users (fname, lname, join_date) VALUES (?,?,?)";
        var inserts = [req.body.fname, req.body.lname, req.body.jdate];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/users');
            }
        });
    });


    router.post('/delete_user', async function (req, res) {
        console.log('delete..');
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM rentals WHERE user_id = ?";
        var inserts = [req.body.userid];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                var sql = "DELETE FROM users WHERE id = ?";
                var inserts = [req.body.userid];
                sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
                    if (error){
                        res.write(JSON.stringify(error));
                        res.status(400);
                        res.end();
                    }else{

                        res.redirect('/users');
                    }
                })
            }
        })


    });

    return router;
}();
