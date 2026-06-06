import { staticTranslations } from '../data/translations';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

/**
 * Translate text using:
 * 1. Static dictionary (instant, offline)
 * 2. MyMemory API (free, no key) for unmatched text
 *
 * Results cached in sessionStorage to avoid redundant API calls on language toggle.
 */
export async function translateText(text, sourceLang = 'en', targetLang = 'en') {
  if (!text || !text.trim()) return text;
  if (sourceLang === targetLang) return text;

  const cacheKey = `translate:${sourceLang}:${targetLang}:${text}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  // Step 1: Try static dictionary
  const staticResult = lookupStatic(text, targetLang);
  if (staticResult !== null) {
    sessionStorage.setItem(cacheKey, staticResult);
    return staticResult;
  }

  // Step 2: Fall back to MyMemory API
  try {
    const res = await fetch(
      `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );
    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    if (translated) {
      sessionStorage.setItem(cacheKey, translated);
      return translated;
    }
  } catch {
    // API failed — return original
  }

  return text;
}

/**
 * Batch translate an array of strings.
 * Uses "|||" separator for MyMemory batching to reduce API calls.
 */
export async function translateBatch(texts, sourceLang = 'en', targetLang = 'en') {
  if (sourceLang === targetLang) return texts;

  const results = new Array(texts.length);
  const uncached = [];
  const indices = [];

  // Check cache and static dict first
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || !text.trim()) {
      results[i] = text;
      continue;
    }

    const cacheKey = `translate:${sourceLang}:${targetLang}:${text}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      results[i] = cached;
      continue;
    }

    const staticResult = lookupStatic(text, targetLang);
    if (staticResult !== null) {
      results[i] = staticResult;
      sessionStorage.setItem(cacheKey, staticResult);
      continue;
    }

    uncached.push(text);
    indices.push(i);
  }

  if (uncached.length === 0) return results;

  // Batch translate via MyMemory using ||| separator
  const separator = ' ||| ';
  const combined = uncached.join(separator);
  try {
    const res = await fetch(
      `${MYMEMORY_URL}?q=${encodeURIComponent(combined)}&langpair=${sourceLang}|${targetLang}`
    );
    const json = await res.json();
    const translatedText = json?.responseData?.translatedText;

    if (translatedText) {
      const translatedParts = translatedText.split(/\s*\|\|\|\s*/);
      for (let i = 0; i < indices.length; i++) {
        const translated = (translatedParts[i] || uncached[i]).trim();
        results[indices[i]] = translated;
        const cacheKey = `translate:${sourceLang}:${targetLang}:${uncached[i]}`;
        sessionStorage.setItem(cacheKey, translated);
      }
      return results;
    }
  } catch {
    // Fall through — return originals for uncached
  }

  for (let i = 0; i < indices.length; i++) {
    results[indices[i]] = uncached[i];
  }
  return results;
}

/**
 * Look up a single word/phrase in the static dictionary.
 * Returns null if not found.
 */
function lookupStatic(text, targetLang) {
  const lower = text.toLowerCase().trim();
  const dict = staticTranslations[targetLang];
  if (!dict) return null;
  return dict[lower] ?? null;
}

/**
 * Supported languages with display info
 */
export const LANGUAGES = [
  { code: 'en', name: 'English',  flag: '🇬🇧', nativeName: 'English'   },
  { code: 'es', name: 'Spanish',  flag: '🇪🇸', nativeName: 'Español'   },
  { code: 'fr', name: 'French',   flag: '🇫🇷', nativeName: 'Français'  },
  { code: 'hi', name: 'Hindi',    flag: '🇮🇳', nativeName: 'हिन्दी'   },
  { code: 'te', name: 'Telugu',   flag: '🇮🇳', nativeName: 'తెలుగు'   },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語'    },
];

/**
 * Validate language code
 */
export function isValidLang(code) {
  return LANGUAGES.some((l) => l.code === code);
}
