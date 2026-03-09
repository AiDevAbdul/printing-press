const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?sslmode=require`,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT email, password_hash FROM users WHERE email = 'admin@printingpress.com'");
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

check();
