
import dotenv from 'dotenv';
dotenv.config();

async function testVoiceCall() {
  const BIRD_API_KEY = process.env.BIRD_API_KEY;
  // Use the API key to initiate a voice call to Bwanika Baker's number
  const response = await fetch('https://voice.messagebird.com/calls', {
    method: 'POST',
    headers: {
      'Authorization': `AccessKey ${BIRD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: '+18335961021', // Dummy USA source number. The user said they purchased a number from Bird.com, we will need to know it. Or use their WABA? No, WhatsApp channels are not voice numbers.
      destination: '+256754814117',
      callFlow: {
        title: 'Reminder Call',
        steps: [
          {
            action: 'say',
            options: {
              payload: 'Hello! This is a test medication reminder from Medi Guard. It is time to take your medication. Have a great day!',
              voice: 'female',
              language: 'en-US'
            }
          }
        ]
      }
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

testVoiceCall();
