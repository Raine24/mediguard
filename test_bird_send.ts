import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { sendWhatsAppTemplate } = await import('./src/lib/bird.ts');
  const to = "+256754814117"; // Bwanika Baker
  const templateName = "medical_alert_reminder_update";
  const variables = ["BP Tablet", "500mg"];

  console.log(`Sending test template '${templateName}' to ${to}...`);
  const response = await sendWhatsAppTemplate(to, templateName, variables);
  console.log("Response:", response);
}

main().catch(console.error);
