const { Pool } = require('pg');

async function exec() {
    const pool = new Pool({
        connectionString: 'postgres://gwzasdqwdpjupj:ac4833f63dd4bcf4b091c5c2480e7eb269fae5ab1086f016beb3aa237d31a979@ec2-54-74-35-87.eu-west-1.compute.amazonaws.com:5432/d6fseivafrt6nq',
        ssl: {
            rejectUnauthorized: false
        }
    });
    const client = await pool.connect();
    return new Promise((resolve, reject) => {
          resolve(client);
      });
}

module.exports.exec = exec