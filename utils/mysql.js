function execQuery(instance, sql, params) {
    return new Promise((resolve, reject) => {
        instance.query(sql, params || [], function(error, results, fields) {
            if (error){
                reject(error);
            }
            resolve(results);
        });
    });
}

function createSqlHelper(instance) {
    var query = (sql, params) => execQuery(instance, sql, params);
    return {
        query,
        select: query,
        insert: query,
        update: query,
        delete: query,
    };
}

module.exports = createSqlHelper;
