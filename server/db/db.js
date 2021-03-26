const mysql = require("mysql");
const dbConfig = require("../config/config.js");

const connection = mysql.createPool({
    connectionLimit : dbConfig.connectionLimit,
    password : dbConfig.password,
    user : dbConfig.user,
    database : dbConfig.database,
    host : dbConfig.host,
    port : dbConfig.port
});

module.exports = connection;
