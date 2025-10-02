declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_SRC = "https://www.googletagmanager.com/gtag/js";

function appendGaScript(id: string) {
  if (document.querySelector(`script[src^="${GA_SRC}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `${GA_SRC}?id=${id}`;
  document.head.appendChild(script);
}

export function setupAnalytics() {
  const { VITE_GA_ID } = import.meta.env;

  if (!VITE_GA_ID) {
    console.warn("Google Analytics not loaded: VITE_GA_ID missing");
    return;
  }

  appendGaScript(VITE_GA_ID);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", VITE_GA_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}
