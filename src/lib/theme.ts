/*
 * Light/dark theme. With no saved choice the site follows the device setting; picking a
 * theme saves it and sets data-theme on <html>, which globals.css reads.
 */

export type Theme = "light" | "dark";

const KEY = "theme";
const EVENT = "themechange";

/** Runs in <head> before the first paint, so a saved theme never flashes the other one. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The theme the page is showing now. */
export function currentTheme(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  return set === "light" || set === "dark" ? set : systemTheme();
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    // Saving the device's own setting would pin it, so clear the choice instead.
    if (theme === systemTheme()) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** For useSyncExternalStore: theme changes from a toggle or from the device setting. */
export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}
