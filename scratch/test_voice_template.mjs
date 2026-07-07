import dotenv from 'dotenv';
dotenv.config();

async function testVoiceTemplate() {
  const workspaceId = process.env.BIRD_WORKSPACE_ID;
  const apiKey = process.env.BIRD_API_KEY;
  const channelId = "d939e5cb-2b3c-51e9-95bc-f205cf40167d"; // The Voice Channel ID
  
  const payload = {
    receiver: {
      contacts: [
        {
          identifierKey: "phonenumber",
          identifierValue: "+256754814117"
        }
      ]
    },
    template: {
      projectId: "c9bb8f9a-1e7b-4a02-8a55-3059952be77c", // Assuming this is the project ID for the voice template
      name: "mediguard_voice_alert_v4",
      version: "latest",
      locale: "en",
      parameters: [
        {
          type: "string",
          key: "medicine_name",
          value: "Panadol"
        },
        {
          type: "string",
          key: "dosage",
          value: "2 tablets"
        }
      ]
    }
  };

  const res = await fetch(`https://api.bird.com/workspaces/${workspaceId}/channels/${channelId}/messages`, {
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

testVoiceTemplate().catch(console.error);
