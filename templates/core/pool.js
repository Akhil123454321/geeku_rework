const util = require('util');
const mysql = require('mysql');
/**
 * Connection to the database.
 *  */
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'Akhil', // use your mysql username.
    password: 'Ask2003#', // user your mysql password.
    database: 'accounts'
});

pool.getConnection((err, connection) => {
    if(err) 
        console.error("Accounts DB connection successful!")
    if(connection)
        connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;