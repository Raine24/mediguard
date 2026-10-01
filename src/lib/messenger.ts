export async function sendMessengerMessage(senderPsid: string, text: string) {
  const BIRD_API_KEY = process.env.BIRD_API_KEY;
  const BIRD_MESSENGER_CHANNEL_ID = process.env.BIRD_MESSENGER_CHANNEL_ID;
  const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID || "1ebab62d-e613-44e1-b4bb-0e46dc1de459";

  if (!BIRD_API_KEY || !BIRD_MESSENGER_CHANNEL_ID) {
    console.error("Missing Bird.com credentials for Messenger.");
    return { status: "failed", error: "Missing config" };
  }

  try {
    const response = await fetch(`https://api.bird.com/workspaces/${BIRD_WORKSPACE_ID}/channels/${BIRD_MESSENGER_CHANNEL_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `AccessKey ${BIRD_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        receiver: {
          contacts: [
            {
              identifierKey: "messenger",
              // The PSID maps to the identifier value for messenger
              identifierValue: senderPsid 
            }
          ]
        },
        body: {
          type: "text",
          text: {
            text: text
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || "Bird.com Messenger API Error");
    }
    return { status: "delivered", data };
  } catch (error: any) {
    console.error('Failed to send Messenger message via Bird.com:', error);
    return { status: "failed", error: error.message };
  }
}
