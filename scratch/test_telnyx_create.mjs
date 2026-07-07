import Telnyx from 'telnyx';
const telnyx = new Telnyx('test');
console.log('Inherited methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(telnyx.calls))));
