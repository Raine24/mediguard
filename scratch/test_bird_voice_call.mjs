import dotenv from 'dotenv';
dotenv.config();

async function initiateCall() {
  const workspaceId = process.env.BIRD_WORKSPACE_ID;
  const apiKey = process.env.BIRD_API_KEY;
  const channelId = "d939e5cb-2b3c-51e9-95bc-f205cf40167d";
  
  const payload = {
    to: "+256754814117",
    callFlow: [
      {
        text: "Hello! This is a medical alert from Medi Guard. It is time to take your medication."
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
