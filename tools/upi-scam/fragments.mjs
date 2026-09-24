/* The narration fragments, in order, one per ~0.5s planning block. These are a FRAGMENTATION of
   the script, never an edit of it: joining them with single spaces must reproduce it
   character-for-character. assertScript() enforces that, and is called by every tool that touches
   narration, so the script cannot drift silently.

   SENTENCES 1-2 ARE THE RECORDED WORDING. The delivered read opened with different words from the
   locked draft, and the decision was to cut the film to what was said rather than re-record. The
   beat map was re-anchored word by word to match — see timeline.ts. Everything from "The moment you
   enter your PIN…" onward is the original script, spoken verbatim. */

export const SCRIPT =
  'The scammer will send you a UPI request disguised to look like an incoming payment. '
+ 'All you seem to have to do is enter your UPI PIN to receive it. '
+ 'The moment you enter your PIN and approve it, however, instead of you getting paid, '
+ 'the money leaves your account. '
+ 'While the common targets for this scam are online sellers, anyone unfamiliar with the '
+ 'basics of UPI transactions can fall for it. '
+ 'If your parents use UPI, let them know that they never need to enter their UPI PIN '
+ 'when receiving money. If a screen asks for their PIN, they are authorising money to '
+ 'leave their account.';

export const FRAGMENTS = [
  'The', 'scammer will', 'send', 'you a', 'UPI', 'request', 'disguised', 'to look',
  'like an', 'incoming', 'payment.', 'All', 'you seem', 'to', 'have to', 'do',
  'is', 'enter', 'your', 'UPI PIN', 'to receive', 'it.', 'The', 'moment', 'you enter', 'your',
  'PIN and', 'approve', 'it,', 'however, instead', 'of', 'you', 'getting paid,', 'the',
  'money leaves', 'your', 'account.', 'While the', 'common', 'targets for', 'this', 'scam',
  'are online', 'sellers,', 'anyone', 'unfamiliar with', 'the', 'basics of', 'UPI',
  'transactions', 'can fall', 'for', 'it.', 'If your', 'parents', 'use UPI,', 'let',
  'them', 'know that', 'they', 'never need', 'to', 'enter', 'their UPI', 'PIN', 'when',
  'receiving', 'money.', 'If a', 'screen', 'asks for', 'their', 'PIN,', 'they are',
  'authorising', 'money', 'to', 'leave their', 'account.',
];

export function assertScript() {
  const joined = FRAGMENTS.join(' ');
  if (joined !== SCRIPT) {
    const n = Math.min(joined.length, SCRIPT.length);
    let i = 0; while (i < n && joined[i] === SCRIPT[i]) i++;
    throw new Error(`FRAGMENTS do not reconstruct SCRIPT at char ${i}\n`
      + `  frags:  …${JSON.stringify(joined.slice(Math.max(0, i - 30), i + 30))}\n`
      + `  script: …${JSON.stringify(SCRIPT.slice(Math.max(0, i - 30), i + 30))}`);
  }
  return true;
}

/* `say` must be told what the letters are, or "UPI" becomes a word and the film's single most
   important token is unintelligible in the first second. Nothing else about the read is altered:
   the em dash becomes the comma a narrator actually performs, and the quote marks around
   "receive" are not spoken. */
export const toSpeech = (s) => s
  .replace(/\bUPI\b/g, 'U.P.I.')
  .replace(/[""”“]/g, '')
  .replace(/—/g, ',')
  .replace(/\s+/g, ' ').trim();
