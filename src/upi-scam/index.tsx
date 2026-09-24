import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { UpiFilm, UPI_WITH_CARD } from './Film';
import { FPS, H, W } from './design';

export const UpiRoot: React.FC = () => (
  <>
    {/* One deliverable: the film plus the channel's approved sign-off. */}
    <Composition id="UpiScam1" component={UpiFilm}
      durationInFrames={UPI_WITH_CARD} fps={FPS} width={W} height={H}
      defaultProps={{ endCard: true }} />
  </>
);
registerRoot(UpiRoot);
