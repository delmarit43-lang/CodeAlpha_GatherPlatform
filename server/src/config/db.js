/* Gather Platform - PostgreSQL Database Connection */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gather_db';

const pool = new Pool({
  connectionString,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isPgConnected = false;

pool.on('connect', () => {
  isPgConnected = true;
});

pool.on('error', (err) => {
  console.warn('PostgreSQL pool background error:', err.message);
  isPgConnected = false;
});

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    isPgConnected = true;
    console.log('Successfully connected to PostgreSQL database!');
    return true;
  } catch (err) {
    isPgConnected = false;
    console.warn(`PostgreSQL DB not connected (${err.message}). Server operating in fallback/demo memory store mode.`);
    return false;
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  checkDatabaseConnection,
  isPgConnected: () => isPgConnected
};
