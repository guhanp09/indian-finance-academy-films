/* ASSET SHEET — every object at the size it is actually used at, on the film's own ground.
 * Rule "assets must be recognisable": "build an asset sheet FIRST ... and look at it before designing
 * any scene on top." This is not part of the film.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FPS, H, LAYOUT, R, S, SCREEN, STATUS_H, T, W, ground } from './design';
import { Label, Plate, Recess, Solid, Glow } from './world/kit';
import { AppBar, PhoneFurniture, PhoneShell, StatusBar } from './world/device';
import { ApkTile, Bubble, CHALLAN_H, Car, ChallanDoc, ChatFurniture, ChatHeader, NumberPlate, Seal } from './world/chat';
import { Block, Road, RoadWorld, Signal } from './world/road';

const Cap: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <Label x={x} y={y} size={22} fill={C.grey} weight={700} track={1.4}>{children}</Label>
);

/* PAGE 1 — the library, at working size */
const Library: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(0);
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={g.deep} />
      <Label x={60} y={78} size={34} fill={C.ink} weight={800} track={2}>ASSET SHEET  ·  01</Label>
      <Label x={60} y={112} size={22} fill={C.grey} weight={600}>
        working sizes, on the film&apos;s own ground
      </Label>

      <Cap x={60} y={186}>NUMBER PLATE · 182px</Cap>
      <NumberPlate x={60} y={200} w={182} />
      <Cap x={300} y={186}>· 120px</Cap>
      <NumberPlate x={300} y={200} w={120} />
      <Cap x={466} y={186}>· 74</Cap>
      <NumberPlate x={470} y={200} w={74} />

      <Cap x={620} y={186}>VEHICLE  ·  150 / 92 / 56</Cap>
      <Car x={620} y={196} w={150} />
      <Car x={790} y={202} w={92} />
      <Car x={900} y={206} w={56} />

      <Cap x={60} y={330}>SEAL</Cap>
      <Seal cx={84} cy={382} r={23} color={C.sky} />
      <Seal cx={152} cy={382} r={14} color={C.sky} />
      <Seal cx={202} cy={382} r={9} color={C.sky} />

      <Cap x={268} y={330}>SIGNAL</Cap>
      <Signal x={268} y={344} s={0.62} phase={2} ground={g.deep} depth={0.2} />
      <Signal x={330} y={352} s={0.42} phase={1} ground={g.deep} depth={0.45} />

      <Cap x={430} y={330}>BLOCK</Cap>
      <Block x={430} y={344} w={92} h={150} seed={3} ground={g.deep} depth={0.35} />
      <Block x={536} y={372} w={72} h={122} seed={9} ground={g.deep} depth={0.55} />

      <Cap x={660} y={330}>MATERIAL · solid / plate / recess</Cap>
      <Solid x={660} y={344} w={110} h={72} r={12} base={C.slate} elevation={8} />
      <Plate x={786} y={344} w={110} h={72} r={12} base={C.card} elevation={8} />
      <Solid x={912} y={344} w={110} h={72} r={12} base={C.slate}>
        <Recess x={924} y={356} w={86} h={48} r={8} host={C.slate} />
      </Solid>
      <Label x={660} y={442} size={17} fill={C.greyDim} weight={600}>
        value ramp + bevel pair — never a stroke on dark
      </Label>

      <Cap x={60} y={510}>THE ATTACHMENT  ·  file state / package state / pressed</Cap>
      <ApkTile x={60} y={524} w={440} pkg={0} />
      <ApkTile x={540} y={524} w={440} pkg={1} />

      <Cap x={60} y={664}>· filename reveal, left to right</Cap>
      {[0.32, 0.62, 1].map((p, i) => <ApkTile key={i} x={60 + i * 340} w={320} y={678} pkg={1} name={p} />)}

      <Cap x={60} y={816}>CHALLAN NOTICE · 422px</Cap>
      <ChallanDoc x={60} y={832} w={422} />

      <Cap x={530} y={816}>· 300px / 190px (recap, ghost)</Cap>
      <ChallanDoc x={530} y={832} w={300} header={1} plate={0.45} amount={0} />
      <ChallanDoc x={856} y={832} w={190} header={1} plate={1} amount={1} />

      <Cap x={60} y={1210}>CAPABILITY IDENTITIES  ·  one colour each, for the life of the film</Cap>
      {([['SMS', C.smsCyan], ['CALLS', C.callViolet], ['BACKGROUND', C.bgAmber], ['VPN', C.vpnRose]] as const)
        .map(([n, col], i) => (
          <g key={n} transform={`translate(${60 + i * 250} 1230)`}>
            <Solid x={0} y={0} w={220} h={86} r={R.systemCard} base={C.navy3} elevation={6} />
            <circle cx={44} cy={43} r={22} fill={col} />
            <Label x={78} y={51} size={n.length > 6 ? 20 : 24} fill={C.ink} weight={700}>{n}</Label>
            <rect x={0} y={92} width={220} height={7} rx={3.5} fill={col} />
          </g>
        ))}

      <Cap x={60} y={1400}>TYPE SCALE  ·  floor is 26px = 5.2pt in the hand</Cap>
      {([['micro 26', T.micro], ['small 32', T.small], ['body 40', T.body], ['label 46', T.label],
        ['head 58', T.head]] as const).map(([n, s], i) => (
          <Label key={n} x={60 + i * 200} y={1466} size={s} fill={C.ink} weight={700}>Ag</Label>
        ))}
      {(['micro 26', 'small 32', 'body 40', 'label 46', 'head 58']).map((n, i) => (
        <Label key={n} x={60 + i * 200} y={1496} size={17} fill={C.greyDim} weight={600}>{n}</Label>
      ))}

      <Cap x={60} y={1570}>GROUND RAMP  ·  the colour script, 12 stops across 130s</Cap>
      {Array.from({ length: 24 }, (_, i) => {
        const gg = ground((i / 23) * 128);
        return (
          <g key={i}>
            <rect x={60 + i * 40} y={1586} width={40} height={54} fill={gg.deep} />
            <rect x={60 + i * 40} y={1640} width={40} height={40} fill={gg.high} />
            <rect x={60 + i * 40} y={1680} width={40} height={22} fill={gg.accent} />
          </g>
        );
      })}
    </g>
  );
};

/* PAGE 2 — the opening composition, assembled */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const g = ground(0);
  const bx = SCREEN.x + 16, bw = SCREEN.w - 64;
  const bh = 16 + CHALLAN_H + 12 + 96 + 34;
  /* the newest message sits at the FOOT of the conversation, just above the composer — which is
     where a real one lands, and which is what stops the lower two-thirds of the screen being a
     dead frame */
  const by = SCREEN.y + SCREEN.h - 118 - bh;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={g.deep} />
      <RoadWorld t={t} scroll={t * 96} ground={g} />
      <PhoneShell>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill={C.chatBg} />
        <ChatFurniture />
        <Bubble x={bx} y={by} w={bw} h={bh}>
          <ChallanDoc x={bx + 16} y={by + 16} w={bw - 32} />
          <ApkTile x={bx + 16} y={by + 16 + CHALLAN_H + 12} w={bw - 32} pkg={0.55} />
        </Bubble>
        <ChatHeader />
        <StatusBar tint="#C3D0E6" label="10:43" />
      </PhoneShell>
      <PhoneFurniture />
    </g>
  );
};

export const Sheet: React.FC<{ page?: number }> = ({ page = 1 }) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {page === 1 ? <Library t={t} /> : <Hook t={t} />}
      </svg>
    </AbsoluteFill>
  );
};
