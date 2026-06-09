"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ColorThemeContext = React.createContext<{
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}>({
  colorTheme: "default",
  setColorTheme: () => null,
});

export function ThemeProvider({ children, ...props }: any) {
  const [colorTheme, setColorThemeState] = React.useState("default");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("color-theme") || "default";
    setColorThemeState(saved);
    if (saved !== "default") {
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  const setColorTheme = (theme: string) => {
    setColorThemeState(theme);
    localStorage.setItem("color-theme", theme);
    if (theme !== "default") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <NextThemesProvider {...props}>
      <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
        {mounted ? children : <div className="contents">{children}</div>}
      </ColorThemeContext.Provider>
    </NextThemesProvider>
  );
}

export const useColorTheme = () => React.useContext(ColorThemeContext);
