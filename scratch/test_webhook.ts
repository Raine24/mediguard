import { POST } from "./src/app/api/webhooks/bird/route";
import { sendWhatsAppAudio } from "./src/lib/bird";

// Mock sendWhatsAppAudio
jest.mock("./src/lib/bird", () => ({
  sendWhatsAppAudio: jest.fn().mockResolvedValue({ status: "accepted" })
}));

async function testWebhook() {
  const req = new Request("http://localhost/api/webhooks/bird", {
    method: "POST",
    body: JSON.stringify({
      message: {
        direction: "incoming",
        sender: {
          contacts: [{ identifierValue: "+256754814117" }]
        },
        body: {
          type: "interactive",
          interactive: {
            button_reply: {
              title: "Play Audio"
            }
          }
        }
      }
    })
  });

  const res = await POST(req);
  const data = await res.json();
  console.log(data);
}

testWebhook();
