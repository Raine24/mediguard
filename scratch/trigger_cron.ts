import fetch from 'node-fetch';

async function testCron() {
  const url = 'https://medicintime.com/api/cron/reminders';
  const secret = 'ab4b60ee78c857418b76df49405206f3';
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });
    const text = await response.text();
    console.log(response.status, text);
  } catch (e: any) {
    console.log(e.message);
  }
}
testCron();
