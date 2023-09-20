import * as crypto from 'crypto';

export default function generateTicketNumber() {
  const yearSuffix: string = new Date().getFullYear().toString().slice(-2);
  const min = 0;
  const max = 9999999; // Range: 0 to 9999999 (7-digit number)
  const randomNumber = crypto.randomInt(min, max);
  return 't-' + yearSuffix + randomNumber.toString().padStart(7, '0');
}
