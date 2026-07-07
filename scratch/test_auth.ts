import Telnyx from 'telnyx';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.TELNYX_API_KEY || '';
console.log("API Key present:", !!apiKey, "Length:", apiKey.length);

const telnyx = new Telnyx({ apiKey });

async function main() {
  try {
    const call = await telnyx.calls.dial({
      connection_id: "2993266444801672682",
      to: "+256754814117",
      from: "+13802272448",
    });
    console.log("SUCCESS");
    console.log(call.data.call_control_id);
  } catch (e: any) {
    console.log("ERROR");
    console.log(e.message);
  }
}
main();
