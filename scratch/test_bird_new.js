

const BIRD_API_KEY = "ayYRMULUklEcCiymFQbYYaxaazvbjp8lJTfl";
const BIRD_WHATSAPP_CHANNEL_ID = "5a29fc74-b02b-5232-a0a1-0ea7146ea74b";
const namespace = "0186b804-f779-4455-acbb-5b2719175964"; // NEW Project ID
const to = "+256754814117"; // Admin's number

async function test() {
  console.log("Sending Bird WhatsApp Template with Project ID:", namespace);

  const bodyVariables = ["James Test", "Test BP Tablet", "500mg"];
  const parameters = bodyVariables.map((val, index) => {
    const keys = ["first_name", "medicine_name", "dosage"];
    return {
      type: "string",
      key: keys[index],
      value: val
    };
  });

  const payload = {
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
      name: "medical_reminder_alert",
      version: "latest",
      locale: "en",
      parameters: parameters
    }
  };

  const BIRD_WORKSPACE_ID = "1ebab62d-e613-44e1-b4bb-0e46dc1de459";
  const response = await fetch(`https://api.bird.com/workspaces/${BIRD_WORKSPACE_ID}/channels/${BIRD_WHATSAPP_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `AccessKey ${BIRD_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Response Status:", response.status);
  console.log("Response Body:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
