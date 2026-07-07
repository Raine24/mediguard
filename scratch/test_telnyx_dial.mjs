import dotenv from 'dotenv';
dotenv.config();
import Telnyx from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY || '');

async function testCall() {
  try {
    const call = await telnyx.calls.dial({
      connection_id: process.env.TELNYX_CONNECTION_ID,
      to: '+256754814117',
      from: process.env.TELNYX_PHONE_NUMBER,
      webhook_url: 'https://medicintime.com/api/webhooks/telnyx' // We don't really need to handle it locally for this quick trigger test
    });
    console.log("Call created:", call.data.call_control_id);
  } catch (error) {
    console.error("Call failed:", error);
  }
}

testCall();
