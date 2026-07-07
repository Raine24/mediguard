import Telnyx from 'telnyx';
const telnyx = new Telnyx({ apiKey: process.env.TELNYX_API_KEY || '' });

async function testAction() {
  try {
    await telnyx.calls.actions.speak('dummy_id', { payload: 'hello', voice: 'female', language: 'en-US' });
    console.log("Success (unexpected)");
  } catch (error) {
    console.log("Error name:", error.name);
    console.log("Error msg:", error.message);
  }
}
testAction();
