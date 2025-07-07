const process = require('node:process');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    ssl: { rejectUnauthorized: false, },
});

module.exports = pool;
