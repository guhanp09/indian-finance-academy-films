/* PHASE 12 · THE RETROSPECTIVE CAUSAL CHAIN   (blocks 168-192, 97.2-111.3 s)
 *
 * "Use ACTUAL earlier assets. The recap's satisfaction comes from recognition." (addendum §54)
 * So every node here is the film's own object, miniaturised — the same notice, the same file tile,
 * the same toggle, the same app icon, the same payload, the same four permission glyphs, the same
 * payment card, the same code tile, the same rack. Nothing is replaced by a generic flowchart
 * icon, and no new visual language is introduced at the end of the film.
 *
 * The chain is a REPRESENTATION, so it may legitimately be drawn on
 * (rule: object creation matches its nature) — but the objects that dock into it are things, and
 * they arrive by moving.
 *
 * The endpoint stays PASSIVE until every user-enabled path has reached it. Only then does it
 * activate: capability was assembled step by step, by the victim.
 */
import React from 'react';
import {
  C, FPS, H, R, S, SCREEN, W, band, clamp01, ease, ground, hash01, impact, lerp, mix, win,
} from '../design';
import { B, CUE } from '../timeline';
import { Grown, Label, Plate, Solid, lit, recede, shade } from '../world/kit';
import { ApkTile, ChallanDoc, NumberPlate } from '../world/chat';
import { AppIcon, PermIcon } from '../world/system';
import { CredPacket, Endpoint, OtpPacket, Payload } from '../world/interior';

/* a serpentine chain: 3 columns, 4 rows, then the endpoint below. Reading order is the film's
   own order, which is the argument. */
const COL = [214, 540, 866];
const ROW = [352, 646, 940, 1234];
const POS: [number, number][] = [
  [COL[0], ROW[0]], [COL[1], ROW[0]], [COL[2], ROW[0]],
  [COL[2], ROW[1]], [COL[1], ROW[1]], [COL[0], ROW[1]],
  [COL[0], ROW[2]], [COL[1], ROW[2]], [COL[2], ROW[2]],
  [COL[2], ROW[3]], [COL[1], ROW[3]], [COL[0], ROW[3]],
];
const CAPTION = [
  'message', 'the file', 'unknown source', 'app installed', 'update', 'payload',
  'SMS', 'calls', 'background', 'VPN', 'payment', 'the code',
];
const ENDPOINT: [number, number] = [540, 1476];

/** when node i docks — spread evenly across the sentence that describes the chain */
const dockAt = (i: number) => lerp(B(169), B(181), i / (POS.length - 1));

const Plinth: React.FC<{
  cx: number; cy: number; p: number; lit0: number; caption: string; g: string;
  children: React.ReactNode;
}> = ({ cx, cy, p, lit0, caption, g, children }) => {
  if (p <= 0.002) return null;
  const s = 0.80 + ease.out(p) * 0.20;
  const dy = (1 - ease.out(p)) * 54;
  return (
    <g transform={`translate(${cx} ${cy + dy}) scale(${s})`} opacity={Math.min(1, p * 2.2)}>
      <Solid x={-104} y={-84} w={208} h={168} r={18}
        base={recede(mix('#243056', C.navy2, 0.3), g, 0.10 - lit0 * 0.10)}
        litK={0.12 + lit0 * 0.14} shadeK={0.22} elevation={7} />
      {lit0 > 0.02 && (
        <rect x={-104} y={-84} width={208} height={168} rx={18} fill="none"
          stroke={C.sky} strokeWidth={3} opacity={lit0 * 0.85} />
      )}
      <g>{children}</g>
      <Label x={0} y={106} size={24} fill={recede(C.grey, g, 0.16)} weight={700} anchor="middle"
        track={1.2} opacity={0.5 + lit0 * 0.5}>{caption}</Label>
    </g>
  );
};

export const Recap: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(t);
  const f = t * FPS;
  /* the three traced arguments of the sentence: install / approve / hand over */
  const tr = (a: number, b: number) => band(t, a, a + 0.25, b, b + 0.3);
  const litFor = (i: number) => {
    if (i <= 4) return tr(CUE.installTrace, CUE.accessTrace);            // "install the malware"
    if (i <= 9) return tr(CUE.accessTrace, CUE.handoverTrace);           // "approve its access"
    return tr(CUE.handoverTrace, CUE.endpointWakes);                     // "hand over ... information"
  };
  const wake = win(t, CUE.endpointWakes, CUE.endpointWakes + 0.5);

  return (
    <g>
      {/* the causal line, traced through the docked nodes */}
      {POS.map((pt, i) => {
        if (i === 0) return null;
        const a = POS[i - 1], b = pt;
        const p = win(t, dockAt(i) - 0.22, dockAt(i) + 0.14);
        const d = `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
        return <Grown key={`l${i}`} d={d} len={Math.hypot(b[0] - a[0], b[1] - a[1])} p={p}
          stroke={recede(C.sky, g.deep, 0.42)} width={S.secondary} />;
      })}
      {/* ...and on to the endpoint, which only the last link reaches */}
      <Grown d={`M${POS[11][0]} ${POS[11][1]} L${ENDPOINT[0]} ${ENDPOINT[1] - 96}`}
        len={Math.hypot(ENDPOINT[0] - POS[11][0], ENDPOINT[1] - 96 - POS[11][1])}
        p={win(t, CUE.handoverTrace, CUE.endpointWakes)}
        stroke={recede(C.red, g.deep, 0.30)} width={S.route} />

      {POS.map((pt, i) => {
        const p = win(t, dockAt(i), dockAt(i) + 0.42);
        const l = litFor(i);
        const node = (() => {
          switch (i) {
            case 0: return <ChallanDoc x={-76} y={-64} w={152} />;
            case 1: return <ApkTile x={-92} y={-32} w={184} pkg={1} />;
            case 2: return (
              <g>
                <Solid x={-46} y={-20} w={92} h={44} r={22} base={C.green} litK={0.2} shadeK={0.2}
                  elevation={3} />
                <circle cx={22} cy={2} r={26} fill={lit(C.green, 0.45)} />
              </g>
            );
            case 3: return <AppIcon x={-44} y={-44} s={1} />;
            case 4: return (
              <g>
                <Solid x={-78} y={-24} w={156} h={52} r={R.button} base={C.cobalt} litK={0.2}
                  shadeK={0.2} elevation={4} />
                <Label x={0} y={10} size={20} fill="#FFF" weight={800} anchor="middle" track={1}>
                  UPDATE
                </Label>
              </g>
            );
            case 5: return <Payload cx={0} cy={0} w={128} ground={g.deep} live={1} danger={0.8} />;
            case 6: return <PermIcon kind="sms" cx={0} cy={0} s={0.86} />;
            case 7: return <PermIcon kind="call" cx={0} cy={0} s={0.86} />;
            case 8: return <PermIcon kind="bg" cx={0} cy={0} s={0.86} />;
            case 9: return <PermIcon kind="vpn" cx={0} cy={0} s={0.86} />;
            case 10: return <CredPacket cx={0} cy={0} s={1.5} hot={1} />;
            default: return <OtpPacket cx={0} cy={0} s={1.5} hot={1} />;
          }
        })();
        return (
          <Plinth key={i} cx={pt[0]} cy={pt[1]} p={p} lit0={l} caption={CAPTION[i]} g={g.deep}>
            {node}
          </Plinth>
        );
      })}

      {/* the rack stays PASSIVE until every user-enabled path has reached it */}
      <g opacity={win(t, CUE.chainNodes[0], CUE.chainNodes[0] + 0.5)}>
        <Endpoint cx={ENDPOINT[0]} cy={ENDPOINT[1]} s={0.62} ground={g.deep} t={t} awake={wake}
          arrivals={wake > 0.5 ? [CUE.endpointWakes + 0.1, CUE.endpointWakes + 0.35] : []} />
        {wake > 0.02 && (
          <rect x={ENDPOINT[0] - 62} y={ENDPOINT[1] - 80} width={124} height={160} rx={14}
            fill="none" stroke={C.red} strokeWidth={3}
            opacity={wake * (0.55 + impact(f, CUE.endpointWakes * FPS, 0.4, 3.4, 3.2))} />
        )}
      </g>
    </g>
  );
};
