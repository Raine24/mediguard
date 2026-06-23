import axios from 'axios';

const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN;
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;

const waClient = axios.create({
  baseURL: `https://graph.facebook.com/v25.0/${WA_PHONE_NUMBER_ID}`,
  headers: {
    'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await waClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace('+', ''), // Meta API expects numbers without the +
      type: 'text',
      text: {
        body: message,
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function sendWelcomeMessage(to: string, name: string) {
  const message = `Welcome to MedicINtime 💊 Your account is now active! Reply YES to confirm this is the right number for your reminders.`;
  return sendWhatsAppMessage(to, message);
}
