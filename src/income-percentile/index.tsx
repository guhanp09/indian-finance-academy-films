import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { IncomePercentileFilm, FILM_TOTAL } from './Film';
import { loadFonts } from './fonts';

loadFonts();

export const IncomePercentileRoot: React.FC = () => (
  <Composition
    id="IncomePercentile"
    component={IncomePercentileFilm}
    durationInFrames={FILM_TOTAL}
    fps={30}
    width={1920}
    height={1080}
  />
);
registerRoot(IncomePercentileRoot);
