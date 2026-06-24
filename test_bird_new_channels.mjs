import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const workspaceId = process.env.BIRD_WORKSPACE_ID;
const apiKey = process.env.BIRD_API_KEY;

const options = {
  hostname: 'api.bird.com',
  path: `/workspaces/${workspaceId}/channels`,
  method: 'GET',
  headers: {
    'Authorization': `AccessKey ${apiKey}`
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("CHANNELS RESPONSE:");
    console.log(data);
  });
});

req.on('error', e => console.error(e));
req.end();
