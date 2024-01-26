import React from 'react';

import { Theme } from '@mui/material';
import { PureLightTheme } from './schemes/PureLightTheme';
import { GreyGooseTheme } from './schemes/GreyGooseTheme';
import { PurpleFlowTheme } from './schemes/PurpleFlowTheme';

export function themeCreator(theme) {
  return themeMap[theme];
}



const themeMap = {
  PureLightTheme,
  GreyGooseTheme,
  PurpleFlowTheme
};
