type SkyWindowAction =
  | 'enter_ar'
  | 'retry_ar'
  | 'exit_ar'
  | 'open_quick_look'
  | 'download_model'
  | 'return_to_sky';

type AnalyticsEvent =
  | { event: 'ui_click'; action_name: SkyWindowAction }
  | { event: 'visit_device'; headset_type: 'meta_quest' | 'unclassified' };

const pushAnalyticsEvent = (event: AnalyticsEvent): void => {
  if (import.meta.env.VITE_GTM_ID?.trim()) {
    window.dataLayer?.push(event);
  }
};

export const trackSkyWindowClick = (action: SkyWindowAction): void => {
  pushAnalyticsEvent({ event: 'ui_click', action_name: action });
};

export const trackVisitDevice = (): void => {
  // Meta Quest Browser exposes this token in its user agent.
  const isQuest = /\bOculusBrowser\//i.test(navigator.userAgent);
  pushAnalyticsEvent({
    event: 'visit_device',
    headset_type: isQuest ? 'meta_quest' : 'unclassified',
  });
};
