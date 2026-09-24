import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, H, LAYOUT, SCREEN, STATUS_H, W } from '../design';
import { City, Streetlight } from './city';
import { CarRear, HandBehind, HandFront, MessageComet, Person } from './cast';
import { PhoneFurniture, PhoneShell, StatusBar } from '../world/device';
import { ApkTile, Bubble, CHALLAN_H, ChallanDoc, ChatFurniture, ChatHeader } from '../world/chat';
import { Light, P } from './style';
import { AppCity, Approach, Courier, I, InsideSky, Office, Parcel, Queue, SourceSwitch, StoreGate, Wall, WarnShield } from './inside';

const BX = SCREEN.x + 16, BW = SCREEN.w - 64;
const BH = 16 + CHALLAN_H + 12 + 96 + 34;
const BY = SCREEN.y + SCREEN.h - 118 - BH;

const Wide: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <City t={t} horizon={1060} street={1380} />
    <Streetlight x={120} y={1440} h={700} />
    <CarRear x={720} y={1640} s={1.42} plateGlow={0.6} />
    <Person x={290} y={1660} s={1.12} />
  </g>
);

const Close: React.FC<{ t: number }> = ({ t }) => {
  const ph = LAYOUT.phone;
  return (
    <g>
      <g transform="translate(0 -120)"><City t={t} horizon={1180} street={1620} /></g>
      <MessageComet x={760} y={250} s={1} ang={152} trail={520} />
      <g transform={`translate(0 60)`}>
        <Light cx={540} cy={900} r={700} color={P.cool} k={0.25} core={0.1} />
        <HandBehind px={ph.x} py={ph.y} pw={ph.w} ph={ph.h} />
        <PhoneShell>
          <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#101A2E" />
          <ChatFurniture />
          <ChatHeader />
          <StatusBar tint="#C3D0E6" label="10:43" />
        </PhoneShell>
        <PhoneFurniture />
        <HandFront px={ph.x} py={ph.y} pw={ph.w} ph={ph.h} />
      </g>
    </g>
  );
};

const Inside: React.FC<{ t: number; open?: number }> = ({ t, open = 0 }) => (
  <g>
    <InsideSky t={t} />
    <AppCity t={t} />
    <Approach t={t} />
    <StoreGate t={t} scan={1} />
    <Wall t={t} hit={open > 0 ? 0 : 1} doorOpen={open} doorMark={open} />
    <Queue t={t} />
    {open === 0 ? (
      <>
        {/* the parcel, stopped DEAD in front of the wall face, squashed by the impact */}
        <Courier x={I.doorX + 60} y={I.ground + 330} s={1.25} t={t} carry={false} />
        <Parcel x={I.doorX - 6} y={I.ground - 40} s={1.4} rot={-10} squash={0.35} />
        <WarnShield x={I.doorX} y={I.wallTop - 130} s={1.25} on={1} />
      </>
    ) : (
      <>
        <g transform={`translate(0 0)`}>
          <SourceSwitch x={I.doorX + 20} y={I.ground + 190} s={1} on={1} press={0} />
        </g>
        <Parcel x={I.doorX} y={I.wallTop + 110} s={1.15} />
      </>
    )}
  </g>
);

export const V2Test: React.FC<{ page?: number }> = ({ page = 1 }) => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05040F' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {page === 1 ? <Wide t={t} /> : page === 2 ? <Close t={t} /> : page === 3 ? <Inside t={t} /> : <Inside t={t} open={1} />}
      </svg>
    </AbsoluteFill>
  );
};
