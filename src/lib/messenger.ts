export async function sendMessengerMessage(senderPsid: string, text: string) {
  const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  
  if (!PAGE_ACCESS_TOKEN) {
    console.log("No MESSENGER_PAGE_ACCESS_TOKEN set, skipping message send");
    return { status: "failed", error: "Missing config" };
  }

  const payload = {
    recipient: { id: senderPsid },
    message: { text }
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Facebook Graph API Error");
    }
    return { status: "delivered", data };
  } catch (error: any) {
    console.error('Failed to send Messenger message:', error);
    return { status: "failed", error: error.message };
  }
}
