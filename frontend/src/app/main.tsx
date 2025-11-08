import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { MaxUI } from "@maxhub/max-ui";

import "@maxhub/max-ui/dist/styles.css";
import "./index.css";
import "./App.css";
import { withQueryClient } from "../providers/query/index.tsx";
import App from "./App.tsx";
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

function MaxUIRoot() {
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
      // Safari 
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MaxUIRoot />
  </React.StrictMode>
);
