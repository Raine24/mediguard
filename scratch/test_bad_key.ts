import Telnyx from 'telnyx';

const telnyx = new Telnyx("bad_key");

async function main() {
  try {
    const call = await telnyx.calls.dial({
      connection_id: "2993266444801672682",
      to: "+1234567890",
      from: "+13802272448",
    });
    console.log(call);
  } catch (e: any) {
    console.log(e.message);
  }
}
main();
