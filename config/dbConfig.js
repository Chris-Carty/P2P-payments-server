import dotenv from 'dotenv'
import mysql from 'mysql'

// Load environment variables into process.env
dotenv.config({ path: '../.env' });

// DATABASE CONNECTION
const config = {
  user : process.env.DB_USERNAME,
  password : process.env.DB_PASSWORD,
  host     : process.env.DB_HOST,
  port     : process.env.DB_PORT,
  database : process.env.DB_NAME,
  sslmode  : 'REQUIRED'

}

const conn = mysql.createConnection(config);

conn.connect((err) => {
if (err) throw err;
console.log('Connected to RvnuDatabase');
});


export default conn