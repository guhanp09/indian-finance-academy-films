/* FAKE e-CHALLAN MALWARE — the locked script, and its fragmentation.
 *
 * FRAGMENTS is not an edit of the script; it is the production plan's own 222 half-second blocks,
 * one string each, in order. Joining them with single spaces must reproduce SCRIPT
 * character-for-character — assertScript() enforces that and every tool that touches narration
 * calls it, so the script cannot drift and block N of the plan is provably fragment N here.
 *
 * That 1:1 correspondence is the audit trail for "no semantic beat was deleted": if a block of the
 * plan has no fragment, this file will not build.
 */

export const SCRIPT =
  'The scammer will send you what looks like an official traffic challan on WhatsApp. It may '
+ 'include your vehicle details, an amount due, and a file named something like “RTO '
+ 'Challan.apk”. You tap the file. Android may warn you that WhatsApp isn’t allowed to install '
+ 'apps from outside the Play Store, but you overlook the warning and tap on “Allow from this '
+ 'source” anyway. The app installs, appears on your phone, and opens to what looks like an '
+ 'e-Challan service. Then when you proceed to pay, it asks you to install an update first, so '
+ 'you tap that too and the update installs. Now the app begins asking for permissions to '
+ 'access your SMS, your phone calls, permission to keep running in the background, and even '
+ 'permission to set up a VPN connection. After allowing all permissions, you finally arrive at '
+ 'the challan payment screen where you enter the details needed to settle the fine. You think '
+ 'you’ve settled your challan, but in reality, the first app was a dropper, and the subsequent '
+ '“update” had actually installed a malware. The financial details you entered into the fake '
+ 'payment screen can be stolen by the malware, and because you’ve already given it access to '
+ 'your SMS, your incoming OTPs can also be automatically forwarded to the attacker’s server — '
+ 'giving them both your bank credentials and the verification codes needed to carry out '
+ 'unauthorised transactions. So what looked like a routine traffic fine was actually a '
+ 'step-by-step process designed to make you install the malware, approve its access, and hand '
+ 'over all the information it needs to carry out an attack. Please be aware that a legitimate '
+ 'traffic challan does not require you to install an APK sent over WhatsApp. If you receive a '
+ 'challan message, it is advisable to verify it yourself through the official e-Challan portal '
+ 'or your state traffic police website before clicking any links in it.';

/* ── THE DESIGNED HOLDS ──────────────────────────────────────────────────────────────────────
   Silence inserted at a word boundary. The SCRIPT IS UNCHANGED — not a word is added, removed or
   reordered; the read simply waits while the picture finishes a thought. Each one is a moment the
   plan asks for by name, and each is a REDUCTION the next event is released from (addendum §13,
   §41, §49). Everything downstream re-times from the new measurement.

   `after` is the last word of the phrase; the first matching occurrence at or after `from` wins,
   because several of these words appear more than once in the script. */
export const HOLDS = [
  /* addendum §13: "Use 100-300ms reductions ... before 'Install Update'". The app has just opened
     and looks legitimate; the intrusion needs a beat of calm to intrude ON. */
  { after: 'service.', hold: 0.34 },
  /* ── THE PERMISSION BEATS ARE GONE, AND THAT IS THE POINT ─────────────────────────────────
     There were three holds here — 2.45 s after "SMS,", 2.40 after "calls," and 2.05 after
     "background," — 5.7 seconds of inserted silence bought so the camera could visit each
     permission in turn and its machine could be built before the next question was asked.

     The picture does not work that way any more. One wavefront leaves the antenna and asks the
     WHOLE CITY at once; all four hatches are open within 0.4 s of each other, and the finger then
     answers them one after another as the narrator names them. Nothing has to be waited for, so
     the list is spoken as a list — which is what it is, and what the read does naturally.

     "from an audience engagement point of view for shorts, this is the weakest part of the video
      that is most likely to cause the viewer to click away so it wouldn't be wise to elongate it
      by waiting for visuals to complete after each permission."

     The read's own pauses at these three anchors are 0.39 s, 0.43 s and 0.40 s, and they are left
     exactly as recorded. */
  { after: 'connection.', hold: 1.12 },
  /* §49 THE FALSE ENDING. The payment has to be allowed to succeed: the spinner resolves, the
     tick draws, the hand leaves, the shoulders drop, motion decays. Without this the viewer's
     brain never closes the loop and the reveal has nothing to reopen. */
  { after: 'fine.', hold: 0.82 },
  /* NEW, for the recorded read. The front of the fake office takes 0.78 s to sink into its
     plinth and the camera has to be still for all of it; the read says "was a dropper, and"
     in 0.36 s, which left the whole descent 0.62 s of window. It is a comma the voice already
     leans on, so the extension is inaudible. */
  { after: 'dropper,', hold: 0.42 },
  /* the reveal is the semantic peak of the film; it is allowed to land before the next sentence
     starts explaining its consequences.
     RAISED 0.46 -> 0.95. The reveal now ENDS on the whole apparatus lit as one body, and at 0.46
     the camera had 1.2s settled on it — less than the permission act gives its closing wide
     (3.7s) for an image ten times more important. This is the landing, not the action. */
  /* RAISED 0.95 -> 1.45. This is the semantic peak of the film — the whole apparatus lit as
     one body — and it is the one image the gate gives a 1.30 s floor. The recorded read left
     it 0.57 s. */
  { after: 'malware.', hold: 1.70 },
];

/* The plan's 222 blocks, in order. Block index === array index. */
export const FRAGMENTS = [
  /* 001-010 · STOP-SCROLL HOOK */
  'The', 'scammer will', 'send', 'you what', 'looks', 'like', 'an official', 'traffic',
  'challan on', 'WhatsApp.',
  /* 011-022 · VEHICLE DETAILS + FINE + RTO Challan.apk */
  'It', 'may include', 'your', 'vehicle details,', 'an', 'amount', 'due, and', 'a',
  'file named', 'something', 'like “RTO', 'Challan.apk”.',
  /* 023-045 · UNKNOWN-SOURCE BARRIER */
  'You', 'tap the', 'file.', 'Android may', 'warn', 'you', 'that WhatsApp', 'isn’t',
  'allowed to', 'install', 'apps', 'from outside', 'the', 'Play', 'Store, but', 'you',
  'overlook the', 'warning', 'and', 'tap on', '“Allow', 'from this', 'source” anyway.',
  /* 046-056 · FIRST APP INSTALLS + FAKE e-CHALLAN SERVICE */
  'The', 'app installs,', 'appears', 'on your', 'phone,', 'and opens', 'to', 'what looks',
  'like', 'an e-Challan', 'service.',
  /* 057-072 · "INSTALL UPDATE" — the tap on PAY, the demand, the tap, the install. The update
     used to arrive out of nowhere; it is now anchored to the pay button, which is how the trick
     actually works — you are made to feel one step from paying. The security-prompt clause was
     cut earlier, and the sentence has been re-fragmented twice now to the SAME 16 blocks so no
     downstream beat index renumbers. Blocks 059 and 060 are single beats on purpose: the finger
     lands on PAY on "pay," and the panel rises on "it asks". */
  'Then', 'when you', 'proceed to', 'pay,', 'it asks', 'you to', 'install', 'an update first, so',
  'you', 'tap', 'that', 'too', 'and', 'the', 'update', 'installs.',
  /* 073-093 · PERMISSION ESCALATION */
  'Now', 'the app', 'begins', 'asking for', 'permissions', 'to access', 'your', 'SMS,',
  'your phone', 'calls,', 'permission to', 'keep', 'running in', 'the', 'background,',
  'and even', 'permission', 'to set', 'up', 'a VPN', 'connection.',
  /* 094-102 · AFTER THE PERMISSIONS — the arrival, not a burst of generic prompts. Same 9 blocks. */
  'After', 'allowing all', 'permissions,', 'you', 'finally arrive', 'at the', 'challan',
  'payment', 'screen',
  /* 103-111 · FALSE RESOLUTION — entering the details. The arrival is already said by the line
     before it, so this sentence is only the typing. Four blocks fewer: the plan's count is now 218. */
  'where you', 'enter', 'the', 'details', 'needed', 'to', 'settle', 'the', 'fine.',
  /* 116-131 · REVEAL — DROPPER + SECOND-STAGE MALWARE */
  'You', 'think you’ve', 'settled', 'your challan,', 'but', 'in reality,', 'the',
  'first app', 'was', 'a', 'dropper, and', 'the', 'subsequent “update”', 'had actually installed',
  'a', 'malware.',
  /* 132-168 · CREDENTIAL THEFT + OTP EXFILTRATION */
  'The', 'financial details', 'you', 'entered into', 'the', 'fake payment', 'screen', 'can',
  'be stolen', 'by', 'the malware,', 'and', 'because you’ve', 'already', 'given',
  'it access', 'to', 'your SMS,', 'your', 'incoming OTPs', 'can also', 'be automatically',
  'forwarded', 'to', 'the attacker’s', 'server', '— giving', 'them', 'both your bank',
  'credentials', 'and', 'the verification', 'codes', 'needed to', 'carry', 'out unauthorised',
  'transactions.',
  /* 169-193 · RETROSPECTIVE CAUSAL CHAIN */
  'So', 'what looked', 'like', 'a routine', 'traffic', 'fine was', 'actually', 'a step-by-step',
  'process', 'designed', 'to make', 'you', 'install the', 'malware,', 'approve its', 'access,',
  'and', 'hand over', 'all', 'the information', 'it', 'needs to', 'carry', 'out an', 'attack.',
  /* 194-206 · PREVENTION */
  'Please', 'be aware', 'that', 'a legitimate', 'traffic', 'challan does', 'not', 'require you',
  'to', 'install an', 'APK', 'sent over', 'WhatsApp.',
  /* 207-222 · SAFE ALTERNATIVE — INDEPENDENT OFFICIAL VERIFICATION */
  'If', 'you receive', 'a', 'challan message, it is advisable to', 'verify', 'it yourself', 'through',
  'the official', 'e-Challan', 'portal', 'or your', 'state', 'traffic police', 'website',
  'before clicking any links in', 'it.',
];

export function assertScript() {
  const joined = FRAGMENTS.join(' ');
  if (joined !== SCRIPT) {
    const n = Math.min(joined.length, SCRIPT.length);
    let i = 0; while (i < n && joined[i] === SCRIPT[i]) i++;
    throw new Error(`FRAGMENTS do not reconstruct SCRIPT at char ${i}\n`
      + `  frags:  …${JSON.stringify(joined.slice(Math.max(0, i - 40), i + 40))}\n`
      + `  script: …${JSON.stringify(SCRIPT.slice(Math.max(0, i - 40), i + 40))}`);
  }
  if (FRAGMENTS.length !== 218)
    throw new Error(`the script is 218 blocks, FRAGMENTS has ${FRAGMENTS.length}`);
  return true;
}

/* The reader must be told what the letters are. Every acronym in this film is load-bearing —
   ".apk" IS the hook, "SMS" and "VPN" are the two permissions the attack is built on, and "OTP"
   is the payload. A TTS engine that says "apk" as a word makes the film unintelligible.
   Nothing else about the read is altered: quote marks are not spoken, the em dash becomes the
   comma a narrator actually performs. */
export const toSpeech = (s) => s
  .replace(/\bRTO\b/g, 'R.T.O.')
  .replace(/\bChallan\.apk\b/g, 'Challan dot A.P.K.')
  .replace(/\bAPK\b/g, 'A.P.K.')
  .replace(/\bSMS\b/g, 'S.M.S.')
  .replace(/\bVPN\b/g, 'V.P.N.')
  .replace(/\bOTPs\b/g, 'O.T.P.s')
  .replace(/\be-Challan\b/g, 'ee challan')
  .replace(/[“”‘’"]/g, (m) => (m === '’' ? "'" : ''))
  .replace(/—/g, ',')
  .replace(/\s+/g, ' ').trim();
