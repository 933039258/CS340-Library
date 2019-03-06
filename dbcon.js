var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_zhangpen',
  password        : '9258',
  database        : 'cs340_zhangpen'
});

module.exports.pool = pool;
