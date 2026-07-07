import dotenv from 'dotenv';
dotenv.config();

async function testVoiceMessages() {
  const workspaceId = process.env.BIRD_WORKSPACE_ID;
  const apiKey = process.env.BIRD_API_KEY;
  
  const payload = {
    recipients: ["+256754814117"],
    body: "Hello! This is a test medical alert from Medi Guard. It is time to take your medication.",
    language: "en-US",
    voice: "female",
    originator: "+16418479148"
  };

  const res = await fetch(`https://api.bird.com/workspaces/${workspaceId}/voicemessages`, {
    method: "POST",
    headers: {
      "Authorization": `AccessKey ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testVoiceMessages().catch(console.error);
