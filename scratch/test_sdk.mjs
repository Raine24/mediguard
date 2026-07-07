import { bird } from '@messagebird/sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = bird(process.env.BIRD_API_KEY);

async function testSDK() {
  try {
    // See what methods are available on the client
    console.log(Object.keys(client));
    
    // Check if voice or calls are available
    if (client.voice || client.calls) {
       console.log("Voice/Calls API is present in the SDK.");
    }
  } catch (error) {
    console.error(error);
  }
}

testSDK();
