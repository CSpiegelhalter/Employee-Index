const mysql = require("mysql")

var connection = mysql.createConnection({
  host     : 'localhost',
  port: 3306,
  user     : 'root',
  password : 'fUnny-p14n0',
  database : 'employees'
});
 
connection.connect();

require("./index.js")(connection)
 
