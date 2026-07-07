import dotenv from 'dotenv';
dotenv.config();

async function getChannels() {
  const workspaceId = process.env.BIRD_WORKSPACE_ID;
  const apiKey = process.env.BIRD_API_KEY;

  const res = await fetch(`https://api.bird.com/workspaces/${workspaceId}/channels`, {
    headers: {
      'Authorization': `AccessKey ${apiKey}`
    }
  });

  const data = await res.json();
  const simple = data.items.map(c => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
    identifier: c.identifier
  }));
  console.log(JSON.stringify(simple, null, 2));
}

getChannels();
