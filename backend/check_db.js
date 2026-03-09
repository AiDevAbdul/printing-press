const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?sslmode=require`,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id, email, full_name, role, is_active FROM users');
    console.log('Users in database:', res.rows);
  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    await client.end();
  }
}

check();
