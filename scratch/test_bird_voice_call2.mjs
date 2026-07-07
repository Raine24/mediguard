import dotenv from 'dotenv';
dotenv.config();

async function initiateCall() {
  const workspaceId = process.env.BIRD_WORKSPACE_ID;
  const apiKey = process.env.BIRD_API_KEY;
  const channelId = "dd4cb7af-a47d-4f50-a4cd-104c6e53f08d";
  
  const payload = {
    to: "+256754814117",
    callFlow: [
      {
        options: {
          text: "Hello! This is a medical alert from Medi Guard. It is time to take your medication.",
          voice: "female",
          language: "en-US"
        }
      }
    ]
  };

  const res = await fetch(`https://api.bird.com/workspaces/${workspaceId}/channels/${channelId}/calls`, {
    method: "POST",
    headers: {
      "Authorization": `AccessKey ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Call Response:", JSON.stringify(data, null, 2));
}

initiateCall().catch(console.error);
