import dotenv from 'dotenv';
dotenv.config();

async function testBirdVoiceChannel() {
  const workspaceId = process.env.BIRD_WORKSPACE_ID;
  const apiKey = process.env.BIRD_API_KEY;
  const channelId = "d939e5cb-2b3c-51e9-95bc-f205cf40167d"; // Provided by user
  
  const payload = {
    receiver: {
      contacts: [
        {
          identifierKey: "phonenumber",
          identifierValue: "+256754814117" // Test to Bwanika Baker
        }
      ]
    },
    body: {
      type: "voice",
      voice: {
        text: "Hello! This is a test medical alert from Medi Guard. It is time to take your medication: Panadol, dosage: 2 tablets. Please take it now. Have a great day!",
        language: "en-US",
        voice: "female"
      }
    }
  };

  console.log("Sending Voice TTS via Workspace Channel API...");
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

testBirdVoiceChannel().catch(console.error);
