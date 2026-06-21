require('dotenv').config();
// We use plain fetch to test the API directly
// Let's actually write a simple fetch script instead of importing NextJS/Prisma deps to avoid TS issues in a plain JS script.

const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_CHANNEL_ID = process.env.BIRD_WHATSAPP_CHANNEL_ID;
const workspaceId = process.env.BIRD_WORKSPACE_ID || "1ebab62d-e613-44e1-b4bb-0e46dc1de459";
const namespace = "c9bb8f9a-1e7b-4a02-8a55-3059952be77c";

async function testV4() {
  const to = "+256754814117"; // The number in the error logs
  const templateName = "mediguard_voice_alert_v4";
  
  console.log("Sending test template to:", to);
  
  const response = await fetch(`https://api.bird.com/workspaces/${workspaceId}/channels/${BIRD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `AccessKey ${BIRD_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      receiver: {
        contacts: [
          {
            identifierKey: "phonenumber",
            identifierValue: to
          }
        ]
      },
      template: {
        projectId: namespace,
        name: templateName,
        version: "latest",
        locale: "en",
        parameters: [
          {
            type: "string",
            key: "medicine_name",
            value: "Super Pill"
          },
          {
            type: "string",
            key: "dosage",
            value: "100mg"
          }
        ]
      }
    })
  });

  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

testV4().catch(console.error);
