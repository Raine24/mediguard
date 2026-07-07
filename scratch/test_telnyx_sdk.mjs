import Telnyx from 'telnyx';
const telnyx = new Telnyx('test');
console.log('Is createSpeak in calls?', 'createSpeak' in telnyx.calls);
console.log('Is speak in calls.actions?', 'speak' in telnyx.calls.actions);
const prototype = Object.getPrototypeOf(telnyx.calls);
console.log('Calls prototype:', Object.getOwnPropertyNames(prototype));
