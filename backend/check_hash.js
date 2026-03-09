const bcrypt = require('bcrypt');
const hash = '$2b$10$8D8EOsBKdj02CbBQwhvpMOo4/4QN6SOMsq9A.oXV9x4f5hWtIelwW';
const passwords = ['admin123', 'admin', 'password', 'admin@123'];

async function check() {
  for (const pw of passwords) {
    const match = await bcrypt.compare(pw, hash);
    console.log(`Password "${pw}": ${match}`);
  }
}

check();
