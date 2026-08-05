/**
 * ttsEngine.js
 * Free internet cloud TTS using Google Translate's undocumented audio endpoint.
 * - No API key required, completely free.
 * - Supports en-IN (Indian English) and hi (Hindi).
 * - Auto-detects Hindi script and switches language accordingly.
 * - Chunks long text to stay within the 200-char limit per request.
 * - Returns a controller object with a stop() method.
 */

const GOOGLE_TTS_BASE = 'https://translate.google.com/translate_tts';

// Detect if text contains Devanagari (Hindi) characters
const isHindi = (text) => /[\u0900-\u097F]/.test(text);

// Split text into safe chunks of max 200 chars, splitting on sentence boundaries
const chunkText = (text, maxLen = 190) => {
  // Split on . ! ? ; and newlines, then re-join short pieces
  const sentences = text.split(/(?<=[.!?;\n])\s+|(?<=।)\s*/);
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    // If a single sentence is too long, hard-split it
    if (sentence.length > maxLen) {
      if (current) { chunks.push(current.trim()); current = ''; }
      for (let i = 0; i < sentence.length; i += maxLen) {
        chunks.push(sentence.slice(i, i + maxLen).trim());
      }
    } else if ((current + ' ' + sentence).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 0);
};

// Build the Google TTS URL for a single chunk
const buildUrl = (text, lang) => {
  const params = new URLSearchParams({
    client: 'tw-ob',
    q: text,
    tl: lang,
    ie: 'UTF-8',
    total: 1,
    idx: 0,
    textlen: text.length,
    prev: 'input',
  });
  return `${GOOGLE_TTS_BASE}?${params.toString()}`;
};

/**
 * Speak text using the free cloud TTS.
 * @param {string} text - The text to speak.
 * @param {Object} options
 * @param {string}   [options.lang]       - Override language ('en-IN' or 'hi')
 * @param {Function} [options.onStart]    - Called when speech begins
 * @param {Function} [options.onEnd]      - Called when all chunks finish
 * @param {number}   [options.rate]       - Playback rate (default 1.0)
 * @returns {{ stop: Function }} - Controller to stop playback
 */
export const speakWithCloud = (text, options = {}) => {
  const clean = text.replace(/[*#_`]/g, '').replace(/\*\*(.*?)\*\*/g, '$1').trim();
  if (!clean) return { stop: () => {} };

  const lang = options.lang || (isHindi(clean) ? 'hi' : 'en-IN');
  const chunks = chunkText(clean);
  let stopped = false;
  let currentAudio = null;
  let chunkIndex = 0;

  const playNext = () => {
    if (stopped || chunkIndex >= chunks.length) {
      if (!stopped && options.onEnd) options.onEnd();
      return;
    }

    const url = buildUrl(chunks[chunkIndex], lang);
    chunkIndex++;

    const audio = new Audio(url);
    audio.playbackRate = options.rate || 1.0;
    currentAudio = audio;

    if (chunkIndex === 1 && options.onStart) options.onStart();

    audio.onended = () => {
      if (!stopped) playNext();
    };
    audio.onerror = () => {
      // On network error, skip to next chunk gracefully
      console.warn('[ttsEngine] chunk failed, skipping');
      if (!stopped) playNext();
    };

    audio.play().catch((e) => {
      console.warn('[ttsEngine] play() blocked:', e);
      // Fallback to Web Speech API if audio is blocked (e.g. autoplay policy)
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(chunks.slice(chunkIndex - 1).join(' '));
        utt.lang = lang;
        utt.onend = options.onEnd;
        window.speechSynthesis.speak(utt);
      }
    });
  };

  playNext();

  return {
    stop: () => {
      stopped = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
      }
    }
  };
};

/**
 * Stop all cloud TTS audio by calling the controller returned from speakWithCloud.
 * Also cancels any fallback Web Speech utterances.
 */
export const stopAllSpeech = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
};
