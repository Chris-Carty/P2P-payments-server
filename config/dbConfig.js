import dotenv from 'dotenv'
import mysql from 'mysql'
dotenv.config({ path: '../.env' }); // Load environment variables into process.env

/*
// PRODUCTION DATABASE

// AZURE connection credentials
const config = {
  host     : process.env.AZURE_SERVER,
  user     : process.env.AZURE_USERNAME,
  password : process.env.AZURE_PASSWORD,
  database : process.env.AZURE_DB_NAME,
  port     : process.env.RDS_PORT
  multipleStatements: true
}
*/

// DEVELOPMENT DATABASE

const config = {
    host     : 'localhost',
    port     : '8889',
    user     : 'root',
    password : 'root',
    database : 'RVNU_Database',
    multipleStatements: true
  
}

const conn = mysql.createConnection(config);

conn.connect((err) => {
  if (err) throw err;
  console.log('Connected to db!');
});

/*

conn.end((err) => {
  // The connection is terminated gracefully
  // Ensures all remaining queries are executed
  // Then sends a quit packet to the MySQL server.
});

*/


export default conn