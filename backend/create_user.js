const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function create() {
  const client = new Client({
    connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?sslmode=require`,
  });

  try {
    const email = 'tester@test.com';
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    await client.connect();
    
    // Check if user exists
    const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
      console.log('User updated');
    } else {
      await client.query(
        'INSERT INTO users (id, email, password_hash, full_name, role, is_active) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)',
        [email, hash, 'Tester User', 'admin', true]
      );
      console.log('User created');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

create();
