import { NextResponse } from 'next/server';
import Telnyx from 'telnyx';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.TELNYX_API_KEY || '';
    const telnyx = new Telnyx({ apiKey });
    
    const event = await req.json();
    
    // The event payload structure from Telnyx
    const eventType = event?.data?.event_type;
    const payload = event?.data?.payload;

    if (!payload || !payload.call_control_id) {
      return NextResponse.json({ success: true });
    }

    const callControlId = payload.call_control_id;
    const clientStateBase64 = payload.client_state;

    if (eventType === 'call.answered') {
      let medicineName = "your medicine";
      let dosage = "1 dose";

      if (clientStateBase64) {
        try {
          const decoded = JSON.parse(Buffer.from(clientStateBase64, 'base64').toString('utf-8'));
          medicineName = decoded.medicineName || medicineName;
          dosage = decoded.dosage || dosage;
        } catch (e) {
          console.error("Failed to decode client_state", e);
        }
      }

      const messageText = `Hello! This is a medical alert from MedicINtime. It is time to take your medication: ${medicineName}, dosage: ${dosage}. Please take it now. Have a great day!`;

      // Instruct Telnyx to speak the message
      await telnyx.calls.actions.speak(callControlId, {
        payload: messageText,
        voice: "female",
        language: "en-US"
      });

      console.log(`TTS Speak command sent for call ${callControlId}`);
    } else if (eventType === 'call.speak.ended') {
      // Hang up the call after the message finishes playing
      await telnyx.calls.actions.hangup(callControlId, {});
      console.log(`Call hung up after speak ended for ${callControlId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telnyx Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
