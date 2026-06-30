import Telnyx from 'telnyx';

export async function initiateVoiceReminderCall(to: string, medicineName: string, dosage: string) {
  const apiKey = process.env.TELNYX_API_KEY || '';
  if (!apiKey) {
    console.error("TELNYX_API_KEY is missing. Cannot initiate voice call.");
    return { status: "failed", error: "Missing configuration" };
  }

  const telnyx = new Telnyx({ apiKey });

  const fromNumber = process.env.TELNYX_PHONE_NUMBER;
  const connectionId = process.env.TELNYX_CONNECTION_ID;

  if (!fromNumber || !connectionId) {
    console.error("Missing Telnyx Phone Number or Connection ID");
    return { status: "failed", error: "Missing configuration" };
  }

  try {
    // We pass the medicine data as client_state so our webhook knows what to say
    const clientState = Buffer.from(JSON.stringify({ medicineName, dosage })).toString('base64');

    const call = await telnyx.calls.dial({
      connection_id: connectionId,
      to: to,
      from: fromNumber,
      client_state: clientState,
      // Our webhook will handle the events for this call
      webhook_url: "https://medicintime.com/api/webhooks/telnyx",
    });

    console.log("Telnyx Call Initiated:", call?.data?.call_control_id);

    return {
      id: call?.data?.call_control_id,
      status: "accepted"
    };
  } catch (error: any) {
    console.error("Failed to initiate Voice Call via Telnyx:", error);
    return { status: "failed", error: error.message || "Unknown error" };
  }
}
