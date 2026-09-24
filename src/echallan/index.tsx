import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { FPS, H, W } from './design';
import { Sheet } from './Sheet';
import { Boards } from './Boards';
import { V2Test } from './v2/Test';
import { OpeningComp, OPENING_FRAMES } from './v2/OpeningComp';
import { PERM_FRAMES, PermBoard, PermSilent, SILENT_FRAMES } from './v2/PermBoard';
import { A3_FRAMES, Act3Board } from './v2/Act3Board';
import { EchallanFilm, FILM_WITH_CARD } from './Film';

export const EchallanRoot: React.FC = () => (
  <>
    {/* design surfaces — not part of the film (rule: mockups before renders) */}
    <Composition id="Sheet" component={Sheet} durationInFrames={240} fps={FPS}
      width={W} height={H} defaultProps={{ page: 1 }} />
    <Composition id="Echallan" component={EchallanFilm} durationInFrames={FILM_WITH_CARD}
      fps={FPS} width={W} height={H} defaultProps={{ endCard: true }} />
    <Composition id="PermBoard" component={PermBoard} durationInFrames={PERM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Act3Board" component={Act3Board} durationInFrames={A3_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="PermSilent" component={PermSilent} durationInFrames={SILENT_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Opening" component={OpeningComp} durationInFrames={OPENING_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="V2Test" component={V2Test} durationInFrames={240} fps={FPS} width={W} height={H} defaultProps={{ page: 1 }} />
    <Composition id="Board" component={Boards} durationInFrames={240} fps={FPS}
      width={W} height={H} defaultProps={{ page: 3 }} />
  </>
);
registerRoot(EchallanRoot);
