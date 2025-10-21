import { OceanBreezeTheme } from './oceanBreeze';

export type Theme = OceanBreezeTheme;

export interface ThemeContextValue {
  theme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
}


