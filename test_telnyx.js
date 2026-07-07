require('dotenv').config();
const Telnyx = require('telnyx');

async function testDial() {
  const telnyx = new Telnyx(process.env.TELNYX_API_KEY);
  try {
    const call = await telnyx.calls.dial({
      connection_id: process.env.TELNYX_CONNECTION_ID,
      to: process.env.TELNYX_PHONE_NUMBER, // calling themselves just to test payload validation
      from: process.env.TELNYX_PHONE_NUMBER,
      client_state: "test",
      timeout_secs: 90,
      webhook_url: "https://medicintime.com/api/webhooks/telnyx",
    });
    console.log("Success! Call Control ID:", call.data.call_control_id);
  } catch (err) {
    console.error("Error creating call:", err.raw ? err.raw.errors : err.message);
  }
}

testDial();
