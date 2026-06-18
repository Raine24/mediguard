const http = require('http');

setInterval(() => {
  console.log(`[${new Date().toISOString()}] Triggering local cron...`);
  
  http.get('http://localhost:3000/api/cron/reminders', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Cron response [${res.statusCode}]: ${data}`);
    });
  }).on('error', (err) => {
    console.error(`Cron error: ${err.message}`);
  });
}, 60000);

console.log("Local Cron simulator started. Pinging every 60 seconds...");
// Ping immediately on start
http.get('http://localhost:3000/api/cron/reminders');
