const { Client } = require('pg');
require('dotenv').config();

async function checkLogs() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query(`SELECT status, "errorReason", "sentAt", "userId" FROM "MessageLog" WHERE channel = 'WHATSAPP' ORDER BY "sentAt" DESC LIMIT 10`);
    console.log("Recent Voice Message Logs:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await client.end();
  }
}

checkLogs();
