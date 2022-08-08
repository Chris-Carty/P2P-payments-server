import dotenv from 'dotenv'
dotenv.config({ path: '../.env' }); // Load environment variables into process.env

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

export default config