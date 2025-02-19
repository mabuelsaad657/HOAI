const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    host: process.env.PGHOST,
    port: 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
      rejectUnauthorized: false // ✅ Enables SSL for secure connection
    }
  });

  try {
    await client.connect();
    console.log("✅ Connected to the database successfully!");
    await client.end();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

testConnection();
