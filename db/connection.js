const mysql = require("mysql")

var connection = mysql.createConnection({
  host     : 'localhost',
  port: 3306,
  user     : 'root',
  password : 'password',
  database : 'employees'
});
 
connection.connect();

require("./index.js")(connection)
 
// connection.end();