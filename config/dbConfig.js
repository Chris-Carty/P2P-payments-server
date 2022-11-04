import dotenv from 'dotenv'
import mysql from 'mysql'
dotenv.config({ path: '../.env' }); // Load environment variables into process.env

/*
// AZURE connection credentials
const config = {
  user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DB_NAME,
  server: process.env.AZURE_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 3000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  }
}
*/

// DEVELOPMENT DATABASE
const config = {
  host     : 'localhost',
  port     : '8889',
  user     : 'root',
  password : 'root',
  database : 'RvnuDatabase'

}

const conn = mysql.createConnection(config);

conn.connect((err) => {
if (err) throw err;
console.log('Connected to RvnuDatabase');
});


export default conn