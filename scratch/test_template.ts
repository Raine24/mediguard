import { sendWhatsAppTemplate } from "../src/lib/bird";

async function run() {
  try {
    const res = await sendWhatsAppTemplate("+256754814117", "mediguard_voice_alert_v1", ["Bwanika Baker", "Magnesium", "50 mg"]);
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

run();
