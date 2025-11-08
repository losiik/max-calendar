import { createContext, useContext } from "react";

import type { WebAppColorScheme } from "./max-web-app";

const ThemeContext = createContext<WebAppColorScheme>("light");

export const ThemeProvider = ThemeContext.Provider;

export const useThemeScheme = (): WebAppColorScheme => {
  return useContext(ThemeContext);
};
