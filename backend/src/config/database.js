const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1, // Sized for serverless: 1 connection per invocation behind the Supabase pooler
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

const query = (text, params) => pool.query(text, params);

module.exports = {
  pool,
  query,
};
