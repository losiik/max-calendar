import { useEffect, useMemo, useState } from "react";
import { MaxUI } from "@maxhub/max-ui";

import { withQueryClient } from "../providers/query";
import App from "./App";
import {
  getWebAppColorScheme,
  getWebAppPlatform,
  onColorSchemeChange,
  WebAppColorScheme,
} from "@/shared/lib/max-web-app";
import { ThemeProvider } from "@/shared/lib/theme-context";

const QueryApp = withQueryClient(() => <App />);

const detectInitialColorScheme = (): WebAppColorScheme => {
  if (typeof window === "undefined") return "light";
  const fromWebApp = getWebAppColorScheme();
  if (fromWebApp) return fromWebApp;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function MaxUIRoot() {
  const [colorScheme, setColorScheme] = useState<WebAppColorScheme>(
    detectInitialColorScheme
  );

  useEffect(() => {
    const unsubscribe = onColorSchemeChange((scheme) => setColorScheme(scheme));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMedia = (event: MediaQueryListEvent) => {
      if (!getWebAppColorScheme()) {
        setColorScheme(event.matches ? "dark" : "light");
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleMedia);
    } else {
      media.addListener(handleMedia);
    }

    return () => {
      unsubscribe?.();
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handleMedia);
      } else {
        media.removeListener(handleMedia);
      }
    };
  }, []);

  const platform = useMemo(() => {
    const detected = getWebAppPlatform();
    return detected === "ios" || detected === "android" ? detected : undefined;
  }, []);

  return (
    <ThemeProvider value={colorScheme}>
      <MaxUI colorScheme={colorScheme} platform={platform}>
        <QueryApp />
      </MaxUI>
    </ThemeProvider>
  );
}

export default MaxUIRoot;
