# AR translations

The AR page and Apple Quick Look entry use Vue I18n in Composition API mode. Their visible copy, accessibility labels, and session messages live in `locales/en.json` and `locales/es.json`.

English is the default and fallback. The page's language selector updates both components and stores the choice under `neuronapixel.locale`; switching also works if storage is blocked. The AR page sets its own `lang` attribute because legacy routes are not translated yet.

Add matching keys to both dictionaries. Session logic emits typed `ArMessageKey` values rather than translated text, so existing status messages update immediately when the language changes. Tests check dictionary parity, saved-language handling, and translated preview and XR guidance.
