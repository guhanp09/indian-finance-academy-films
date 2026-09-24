// One icon family: 100×100 grid, 7-unit stroke, round joins, no fills except
// where a solid reads better than an outline. Every icon in the film is drawn
// here so line weight and simplification level cannot drift between scenes.
import React from 'react';
import { C } from './tokens';

const P: Record<string, React.ReactNode> = {
  person: (<>
    <circle cx="50" cy="27" r="14" />
    <path d="M22 84c0-17 12.5-28 28-28s28 11 28 28" />
  </>),
  apartment: (<>
    <path d="M24 86V22h52v64" />
    <path d="M16 86h68" />
    <path d="M36 36h10M54 36h10M36 54h10M54 54h10" />
    <path d="M42 86V68h16v18" />
  </>),
  groceries: (<>
    <path d="M26 38h48l-5 46H31z" />
    <path d="M40 38v-7a10 10 0 0 1 20 0v7" />
  </>),
  utilities: (<>
    <path d="M56 14L28 56h18l-4 30 28-42H52z" />
  </>),
  transport: (<>
    <rect x="20" y="24" width="60" height="46" rx="7" />
    <path d="M20 46h60" />
    <circle cx="34" cy="80" r="7" />
    <circle cx="66" cy="80" r="7" />
  </>),
  leisure: (<>
    <path d="M28 32h38v20a19 19 0 0 1-38 0z" />
    <path d="M66 38h6a9 9 0 0 1 0 18h-6" />
    <path d="M24 82h48" />
  </>),
  phone: (<>
    <rect x="33" y="12" width="34" height="76" rx="8" />
    <path d="M44 22h12" />
    <path d="M44 78h12" />
  </>),
  car: (<>
    <path d="M18 66h64" />
    <path d="M24 66l6-20h40l6 20" />
    <path d="M42 46V66M58 46V66" />
    <circle cx="34" cy="74" r="8" />
    <circle cx="66" cy="74" r="8" />
  </>),
  machine: (<>
    <circle cx="50" cy="50" r="17" />
    <path d="M50 16v10M50 74v10M16 50h10M74 50h10M26 26l7 7M67 67l7 7M74 26l-7 7M33 67l-7 7" />
  </>),
  fridge: (<>
    <rect x="32" y="12" width="36" height="76" rx="7" />
    <path d="M32 44h36" />
    <path d="M60 26v10M60 52v10" />
  </>),
  internet: (<>
    <path d="M20 44a42 42 0 0 1 60 0" />
    <path d="M32 58a26 26 0 0 1 36 0" />
    <circle cx="50" cy="76" r="5" />
  </>),
  globe: (<>
    <circle cx="50" cy="50" r="32" />
    <path d="M50 18v64" />
    <path d="M18 50h64" />
    <path d="M50 18c-13 9-13 55 0 64M50 18c13 9 13 55 0 64" />
  </>),
  land: (<>
    <path d="M22 32h56v48H22z" />
    <path d="M40 32v48M60 32v48M22 50h56M22 64h56" />
  </>),
  vault: (<>
    <rect x="18" y="22" width="64" height="58" rx="7" />
    <circle cx="50" cy="51" r="13" />
    <path d="M50 30v8M50 64v8M29 51h8M63 51h8" />
  </>),
  invest: (<>
    <path d="M24 68l16-18 12 10 24-26" />
    <path d="M60 34h16v16" />
  </>),
  shield: (<>
    <path d="M50 14l28 12v22c0 19-14 29-28 36-14-7-28-17-28-36V26z" />
  </>),
  rent: (<>
    <path d="M22 48L50 24l28 24" />
    <path d="M30 44v38h40V44" />
    <path d="M42 82V60h16v22" />
  </>),
  scissors: (<>
    <circle cx="28" cy="76" r="11" />
    <circle cx="72" cy="76" r="11" />
    <path d="M36 68L72 18M64 68L28 18" />
  </>),
  fuel: (<>
    <path d="M22 84V26a8 8 0 0 1 8-8h22a8 8 0 0 1 8 8v58" />
    <path d="M16 84h52" />
    <path d="M30 32h22v16H30z" />
    <path d="M60 40h12v26a7 7 0 0 0 12 5V34l-9-9" />
  </>),
  factory: (<>
    <path d="M18 84V46l20 12V46l20 12V26h24v58z" />
    <path d="M12 84h76" />
    <path d="M70 40h10M70 56h10" />
  </>),
  /* A banknote: what a worker is paid, in the same object the meter is
     stacked out of. */
  wage: (<>
    <rect x="10" y="28" width="80" height="44" rx="7" />
    <circle cx="50" cy="50" r="11" />
    <path d="M24 40v20M76 40v20" />
  </>),
  /* Open at the top on purpose: things are dropped into it on screen, so the
     rim has to read as an opening rather than a lid. */
  basket: (<>
    <path d="M20 38h60l-8 48H28z" />
    <path d="M10 38h80" />
    <path d="M40 52v22M60 52v22" />
  </>),
  wrench: (<>
    <path d="M70 16a20 20 0 0 0-24 27L18 71a9 9 0 0 0 13 13l28-28a20 20 0 0 0 27-24L74 44 58 40 54 24z" />
  </>),
  /* Not an object but a claim about one: "more of this". Drawn tall inside the
     grid so that at the size it is used it stands as high as the thing it is
     annotating is wide. */
  up: (<>
    <path d="M50 90V27" />
    <path d="M28 49L50 25l22 24" />
  </>),
};

export type IconName = keyof typeof P;

export const Icon: React.FC<{
  name: IconName; size?: number; color?: string; sw?: number; op?: number; draw?: number;
}> = ({ name, size = 76, color = C.ink, sw = 7, op = 1, draw = 1 }) => {
  const kids = React.Children.toArray((P[name] as React.ReactElement<{ children: React.ReactNode }>).props.children);
  const d = Math.max(0, Math.min(1, draw));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity: op, display: 'block' }}
      fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {kids.map((k, i) =>
        React.isValidElement(k)
          ? React.cloneElement(k as React.ReactElement<Record<string, unknown>>, {
              key: i, pathLength: 100, strokeDasharray: 100, strokeDashoffset: 100 * (1 - d),
            })
          : k)}
    </svg>
  );
};

/** Icon over its own caption — the unit the lifestyle basket is built from. */
export const IconCell: React.FC<{
  x: number; y: number; name: IconName; label?: string; size?: number;
  color?: string; op?: number; s?: number; draw?: number;
}> = ({ x, y, name, label, size = 76, color = C.ink, op = 1, s = 1, draw = 1 }) => (
  <div style={{
    position: 'absolute', left: x, top: y, opacity: op,
    transform: s === 1 ? undefined : `scale(${s})`, transformOrigin: 'center top',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: size + 40,
  }}>
    <Icon name={name} size={size} color={color} draw={draw} />
    {label ? (
      <div style={{
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: 20, fontWeight: 700,
        letterSpacing: 1.8, color, textAlign: 'center', whiteSpace: 'nowrap',
      }}>{label}</div>
    ) : null}
  </div>
);
