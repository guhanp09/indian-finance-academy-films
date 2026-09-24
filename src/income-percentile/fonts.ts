// Fonts are loaded once at root so every scene shares the same metrics.
import { loadFont as loadDisplay } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/IBMPlexMono';

export const loadFonts = () => {
  loadDisplay('normal', { weights: ['400'], subsets: ['latin'] });
  loadDisplay('italic', { weights: ['400'], subsets: ['latin'] });
  loadSans('normal', { weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] });
  loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] });
};
