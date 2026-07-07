import Telnyx from 'telnyx';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    // How we currently do it in the code:
    const telnyx1 = new Telnyx({ apiKey: process.env.TELNYX_API_KEY });
    await telnyx1.calls.dial({
      connection_id: "2993266444801672682",
      to: "+256754814117",
      from: "+13802272448",
    });
    console.log("Success with object");
  } catch (e: any) {
    console.log("Error with object:", e.message);
  }

  try {
    // How the docs probably say to do it in TS:
    const telnyx2 = Telnyx(process.env.TELNYX_API_KEY);
    await telnyx2.calls.dial({
      connection_id: "2993266444801672682",
      to: "+256754814117",
      from: "+13802272448",
    });
    console.log("Success with function call");
  } catch (e: any) {
    console.log("Error with function call:", e.message);
  }
}
main();
