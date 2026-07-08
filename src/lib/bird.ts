const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_CHANNEL_ID = process.env.BIRD_WHATSAPP_CHANNEL_ID;

export interface BirdMessageResponse {
  id?: string;
  status: "accepted" | "failed" | "delivered" | "read";
  error?: string;
}

/**
 * Sends a WhatsApp message via Bird.com Conversations API.
 * Uses freeform text messages. Note: WhatsApp requires an active 24h window
 * from the user to receive freeform text messages, otherwise an approved template must be used.
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<BirdMessageResponse> {
  if (!BIRD_API_KEY || !BIRD_CHANNEL_ID) {
    console.error("Missing Bird.com credentials in environment variables.");
    return { status: "failed", error: "Missing configuration" };
  }

  try {
    const response = await fetch("https://conversations.messagebird.com/v1/send", {
      method: "POST",
      headers: {
        "Authorization": `AccessKey ${BIRD_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to,
        from: BIRD_CHANNEL_ID,
        type: "text",
        content: {
          text
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bird.com API Error:", data);
      return { 
        status: "failed", 
        error: data?.errors?.[0]?.description || data?.errors?.[0]?.message || "API request failed" 
      };
    }

    return {
      id: data.id,
      status: data.status || "accepted"
    };

  } catch (error: any) {
    console.error("Failed to send WhatsApp message via Bird.com:", error);
    return { status: "failed", error: error.message || "Unknown error" };
  }
}

/**
 * Sends a WhatsApp Highly Structured Message (HSM) template via Bird.com.
 * This is required for sending automated reminders outside the 24h interaction window.
 */
export async function sendWhatsAppTemplate(
  to: string, 
  templateName: string, 
  bodyVariables: string[]
): Promise<BirdMessageResponse> {
  if (!BIRD_API_KEY || !BIRD_CHANNEL_ID) {
    console.error("Missing Bird.com credentials in environment variables.");
    return { status: "failed", error: "Missing configuration" };
  }

  // The Workspace ID is required for the new Bird CRM API
  const workspaceId = process.env.BIRD_WORKSPACE_ID || "1ebab62d-e613-44e1-b4bb-0e46dc1de459";
  // The namespace is usually the Project ID where the template lives
  const namespace = process.env.BIRD_WHATSAPP_NAMESPACE || "ef6e87b7-1206-40ad-978a-ded584c0f2f8"; 

  try {
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
          projectId: templateName === "mediguard_voice_alert_v4" 
            ? "c9bb8f9a-1e7b-4a02-8a55-3059952be77c" 
            : templateName === "medical_alert_reminder_update"
              ? "f2b24a57-c1c5-4ba1-88b7-4b0a1ec43e0c"
              : templateName === "verification_code_update"
                ? "e59bfed6-212c-4687-a2a1-8087c3da11a1"
                : namespace,
          name: templateName,
          version: "latest",
          locale: "en",
          parameters: bodyVariables.map((val, index) => {
            let varKey = `var_${index + 1}`;
            
            if (["verification_code", "verification_code_update"].includes(templateName)) {
              varKey = "otp";
            } else if (["mediguard_voice_alert_v4", "medical_reminder_alert", "medical_alert_reminder_update"].includes(templateName)) {
              const keys = ["medicine_name", "dosage"];
              varKey = keys[index] || varKey;
            }
            
            return {
              type: "string",
              key: varKey,
              value: val
            };
          })
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bird.com Template API Error:", data);
      return { 
        status: "failed", 
        error: data?.message || data?.errors?.[0]?.description || "API request failed" 
      };
    }

    return {
      id: data.id,
      status: data.status || "accepted"
    };

  } catch (error: any) {
    console.error("Failed to send WhatsApp template via Bird.com:", error);
    return { status: "failed", error: error.message || "Unknown error" };
  }
}

export async function sendWhatsAppAudio(to: string, audioUrl: string) {
  if (!BIRD_API_KEY || !BIRD_CHANNEL_ID) {
    console.error("Missing Bird.com credentials for audio message.");
    return { status: "failed", error: "Missing configuration" };
  }

  const workspaceId = process.env.BIRD_WORKSPACE_ID || "1ebab62d-e613-44e1-b4bb-0e46dc1de459";

  try {
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
        body: {
          type: "audio",
          audio: {
            url: audioUrl
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bird.com Audio API Error:", data);
      return { 
        status: "failed", 
        error: data?.message || data?.errors?.[0]?.description || "API request failed" 
      };
    }

    return {
      id: data.id,
      status: data.status || "accepted"
    };

  } catch (error: any) {
    console.error("Failed to send WhatsApp Audio via Bird.com:", error);
    return { status: "failed", error: error.message || "Unknown error" };
  }
}

export async function sendVoiceReminder(to: string, medicineName: string, dosage: string) {
  if (!BIRD_API_KEY) {
    console.error("Missing Bird.com credentials for voice call.");
    return { status: "failed", error: "Missing configuration" };
  }

  const workspaceId = process.env.BIRD_WORKSPACE_ID || "1ebab62d-e613-44e1-b4bb-0e46dc1de459";
  // The user provided this channel ID for voice
  const voiceChannelId = "dd4cb7af-a47d-4f50-a4cd-104c6e53f08d";

  const messageText = `Hello! This is a medical alert from Medi Guard. It is time to take your medication: ${medicineName}, dosage: ${dosage}. Please take it now. Have a great day!`;

  try {
    const response = await fetch(`https://api.bird.com/workspaces/${workspaceId}/channels/${voiceChannelId}/calls`, {
      method: "POST",
      headers: {
        "Authorization": `AccessKey ${BIRD_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: to,
        callFlow: [
          {
            options: {
              text: messageText,
              voice: "female",
              language: "en-US"
            }
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Bird.com Voice Call API Error:", data);
      return { 
        status: "failed", 
        error: data?.message || data?.errors?.[0]?.description || "API request failed" 
      };
    }

    return {
      id: data.id,
      status: data.status || "accepted"
    };

  } catch (error: any) {
    console.error("Failed to send Voice Call via Bird.com:", error);
    return { status: "failed", error: error.message || "Unknown error" };
  }
}
