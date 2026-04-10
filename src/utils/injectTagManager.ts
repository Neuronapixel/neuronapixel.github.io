declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const injectTagManager = (tagManagerId?: string): void => {
  const trimmedId = tagManagerId?.trim();

  if (
    !trimmedId ||
    typeof document === 'undefined' ||
    typeof window === 'undefined'
  ) {
    return;
  }

  if (document.getElementById('gtm-script')) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(trimmedId)}`;
  document.head.appendChild(script);
};
