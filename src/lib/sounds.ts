// 🎵 Cartoon-Grade Sound System for Kids
// Looney Tunes-inspired, age-appropriate, magnetic & interactive
const SOUND_KEY = "english-fun-sound-enabled";
const MUSIC_KEY = "english-fun-music-enabled";

// Extend the Window type to include the webkit-prefixed AudioContext (Safari legacy)
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const isSoundEnabled = (): boolean => localStorage.getItem(SOUND_KEY) !== "false";
export const isMusicEnabled = (): boolean => localStorage.getItem(MUSIC_KEY) !== "false";
export const setSoundEnabled = (v: boolean) => localStorage.setItem(SOUND_KEY, String(v));
export const setMusicEnabled = (v: boolean) => {
  localStorage.setItem(MUSIC_KEY, String(v));
  if (!v) stopBgMusic();
};

// ─── Smart Voice Selection ───
// Finds the most kid-friendly, cartoon-like voice available on the platform
const getKidVoice = (lang: string): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priority keywords for kid-friendly voices (ordered by preference)
  const kidKeywords = ['child', 'kid', 'junior', 'samantha', 'karen', 'zira', 'google us english'];
  const hebrewKeywords = ['carmit', 'he-il', 'he_il', 'hebrew'];
  const arabicKeywords = ['ar-sa', 'ar_sa', 'arabic', 'maged'];

  const langVoices = voices.filter(v => v.lang.startsWith(lang.slice(0, 2)));

  // Try kid-specific voices first
  for (const kw of kidKeywords) {
    const match = langVoices.find(v => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  // For Hebrew/Arabic, find any matching voice
  if (lang.startsWith('he')) {
    for (const kw of hebrewKeywords) {
      const match = voices.find(v => v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw));
      if (match) return match;
    }
  }
  if (lang.startsWith('ar')) {
    for (const kw of arabicKeywords) {
      const match = voices.find(v => v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw));
      if (match) return match;
    }
  }

  // Prefer female voices (generally sound friendlier for kids)
  const femaleVoice = langVoices.find(v =>
    /female|woman|girl/i.test(v.name) || /samantha|victoria|alex|karen|moira|tessa|fiona/i.test(v.name)
  );
  if (femaleVoice) return femaleVoice;

  return langVoices[0] || null;
};

// ─── Speech ───
// Cartoon-character voice: high pitch, slightly slow for clarity, warm & bouncy
export const speak = (text: string, lang: string = 'en-US', rate: number = 0.78) => {
  if (!('speechSynthesis' in window) || !isSoundEnabled()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.5; // Higher pitch = more cartoon-like, kid-friendly
  utterance.volume = 1;

  const voice = getKidVoice(lang);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
};

// English: Slow, clear, enthusiastic - like a friendly cartoon teacher
export const speakEnglish = (text: string) => speak(text, 'en-US', 0.72);
// Hebrew: Slightly faster, warm
export const speakHebrew = (text: string) => speak(text, 'he-IL', 0.82);
// Arabic: Clear and warm
export const speakArabic = (text: string) => speak(text, 'ar-SA', 0.80);

// Speak with extra enthusiasm (for celebrations, correct answers)
export const speakExcited = (text: string) => {
  if (!('speechSynthesis' in window) || !isSoundEnabled()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1.7; // Extra high for excitement
  utterance.volume = 1;
  const voice = getKidVoice('en-US');
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
};

// Letter-by-letter spelling voice (slower, more deliberate)
export const speakSpelling = (letter: string) => {
  if (!('speechSynthesis' in window) || !isSoundEnabled()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(letter);
  utterance.lang = 'en-US';
  utterance.rate = 0.6; // Very slow for letter clarity
  utterance.pitch = 1.4;
  utterance.volume = 1;
  const voice = getKidVoice('en-US');
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
};

// ─── Audio Context ───
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext!)() : null;

const ensureContext = () => {
  if (audioCtx?.state === 'suspended') audioCtx.resume();
};

const playTone = (freq: number, start: number, dur: number, vol = 0.3, type: OscillatorType = 'sine') => {
  if (!audioCtx || !isSoundEnabled()) return;
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  // Smooth envelope for cartoon-like warmth (no harsh attacks)
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
  osc.start(start);
  osc.stop(start + dur);
};

// Rich chord for magical moments
const playChord = (freqs: number[], start: number, dur: number, vol = 0.12) => {
  freqs.forEach(f => playTone(f, start, dur, vol));
};

// Cartoon "boing" effect - wobbling pitch for playful feel
const playBoing = (baseFreq: number, start: number, vol = 0.15) => {
  if (!audioCtx || !isSoundEnabled()) return;
  ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  // Pitch swoops up then settles - classic cartoon boing
  osc.frequency.setValueAtTime(baseFreq * 0.5, start);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, start + 0.06);
  osc.frequency.exponentialRampToValueAtTime(baseFreq, start + 0.15);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
  osc.start(start);
  osc.stop(start + 0.25);
};

// Cartoon sparkle/twinkle trail
const playSparkleTrail = (start: number, count = 5, vol = 0.04) => {
  for (let i = 0; i < count; i++) {
    playTone(2000 + i * 400, start + i * 0.04, 0.08, vol, 'triangle');
  }
};

// ─── Sound Effects (Cartoon-Grade) ───

// ✅ Correct answer - triumphant "TA-DA!" with sparkles
export const playCorrectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Bright ascending major triad - like a cartoon "correct!" jingle
  playTone(523, t, 0.12, 0.2);       // C5
  playTone(659, t + 0.05, 0.12, 0.2); // E5
  playTone(784, t + 0.1, 0.18, 0.25); // G5
  playTone(1047, t + 0.15, 0.2, 0.2); // C6 - triumphant top
  // Boing on the top note for cartoon feel
  playBoing(1047, t + 0.18, 0.1);
  // Sparkle cascade
  playSparkleTrail(t + 0.25, 4, 0.05);
};

// ❌ Wrong answer - gentle cartoon "womp womp" (not scary!)
export const playWrongSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Descending minor - sad trombone style but cute
  playTone(350, t, 0.15, 0.12, 'triangle');
  playTone(300, t + 0.12, 0.15, 0.1, 'triangle');
  playTone(260, t + 0.24, 0.2, 0.08, 'triangle');
  // Gentle wobble at the end
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, t + 0.36);
  // Vibrato for cartoon "sad" effect
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(6, t + 0.36);
  lfoGain.gain.setValueAtTime(15, t + 0.36);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  lfo.start(t + 0.36);
  lfo.stop(t + 0.7);
  gain.gain.setValueAtTime(0.08, t + 0.36);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
  osc.start(t + 0.36);
  osc.stop(t + 0.7);
};

// 🖱️ Click/tap - cartoon "pop" bubble
export const playClickSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Quick pitch-up pop like a bubble
  playBoing(900, t, 0.08);
};

// ⭐ Star earned - magical Disney-like ascending sparkle
export const playStarSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Magical ascending pentatonic scale
  const scale = [523, 659, 784, 988, 1175, 1319];
  scale.forEach((freq, i) => {
    playTone(freq, t + i * 0.07, 0.3, 0.12);
    playTone(freq * 2, t + i * 0.07 + 0.02, 0.12, 0.04, 'triangle');
  });
  // Grand sparkle chord at top
  playChord([1047, 1319, 1568, 2093], t + scale.length * 0.07, 0.6, 0.06);
  // Twinkling trail
  playSparkleTrail(t + scale.length * 0.07 + 0.2, 6, 0.03);
};

// 🔥 Combo streak - increasingly epic cartoon power-up
export const playComboSound = (combo: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const baseFreq = 400 + combo * 100;
  // Fast ascending arpeggio - gets higher with each combo
  for (let i = 0; i < Math.min(combo + 2, 6); i++) {
    playTone(baseFreq + i * 180, t + i * 0.04, 0.1, 0.15);
  }
  // Cartoon "boing" bounce at combo 3+
  if (combo >= 3) {
    playBoing(baseFreq * 2, t + 0.2, 0.1);
    playChord([baseFreq * 2, baseFreq * 2.5, baseFreq * 3], t + 0.28, 0.2, 0.06);
  }
  // Power-up "whoosh" at combo 5+
  if (combo >= 5) {
    playSparkleTrail(t + 0.3, 8, 0.04);
    // Rising "power beam"
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 2, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 6, t + 0.55);
    gain.gain.setValueAtTime(0.06, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.55);
    osc.start(t + 0.35);
    osc.stop(t + 0.55);
  }
};

// ⏱️ Timer tick - gentle metronome
export const playTickSound = () => {
  if (!audioCtx) return;
  playTone(1200, audioCtx.currentTime, 0.03, 0.05);
};

// ⚠️ Timer warning - urgent but not scary
export const playTimerWarning = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(600, t, 0.08, 0.15);
  playTone(500, t + 0.1, 0.08, 0.15);
  playTone(400, t + 0.2, 0.12, 0.12);
  // Gentle wobble
  playBoing(300, t + 0.3, 0.08);
};

// 🏆 Victory fanfare - full cartoon celebration orchestra
export const playVictoryFanfare = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Triumphant fanfare melody (Looney Tunes style "That's All Folks" vibe)
  const melody = [392, 440, 523, 523, 659, 659, 784, 880, 1047];
  melody.forEach((freq, i) => {
    const delay = i < 4 ? i * 0.1 : 0.4 + (i - 4) * 0.08;
    playTone(freq, t + delay, 0.18, 0.18);
    // Harmony underneath
    if (i >= 4) playTone(freq * 0.5, t + delay, 0.2, 0.06);
  });
  // Grand finale chord
  const finale = t + 1.0;
  playChord([523, 659, 784], finale, 0.5, 0.1);
  playChord([784, 1047, 1319], finale + 0.25, 0.6, 0.08);
  playChord([1047, 1319, 1568], finale + 0.5, 0.8, 0.06);
  // Sparkle cascade finale
  playSparkleTrail(finale + 0.7, 8, 0.04);
  // Final cartoon "boing" flourish
  playBoing(2093, finale + 1.0, 0.05);
};

// 🔤 Letter pop - musical xylophone note (each letter has its own pitch)
export const playLetterPopSound = (index: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Xylophone-like chromatic scale for each letter
  const freq = 350 + index * 60;
  playTone(freq, t, 0.1, 0.15, 'triangle');
  playTone(freq * 2, t + 0.015, 0.06, 0.06, 'sine');
  // Cartoon "ding" resonance
  playTone(freq * 3, t + 0.03, 0.04, 0.02, 'sine');
};

// 🎉 Welcome chime - warm, inviting cartoon intro
export const playWelcomeChime = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Music box style ascending with warmth
  const notes = [349, 440, 523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playTone(freq, t + i * 0.12, 0.35, 0.1, 'triangle');
    playTone(freq * 0.5, t + i * 0.12, 0.25, 0.04, 'sine');
  });
  // Magical chord bloom
  playChord([523, 659, 784, 1047], t + notes.length * 0.12, 0.7, 0.05);
  playSparkleTrail(t + notes.length * 0.12 + 0.3, 4, 0.03);
};

// 👆 Selection sound - cute cartoon "boop"
export const playSelectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playBoing(700, t, 0.1);
};

// 🆙 Level up - epic cartoon power-up transformation
export const playLevelUpSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Rapid ascending chromatic scale - "powering up!"
  const scale = [392, 440, 494, 523, 587, 659, 698, 784, 880, 988, 1047];
  scale.forEach((freq, i) => {
    playTone(freq, t + i * 0.045, 0.12, 0.1 + i * 0.008);
  });
  const end = t + scale.length * 0.045;
  // Explosion of sound at the top
  playChord([1047, 1319, 1568, 2093], end, 0.8, 0.1);
  playBoing(2093, end + 0.1, 0.08);
  // Sparkle rain
  playSparkleTrail(end + 0.3, 8, 0.04);
  // Final power chord
  playChord([1568, 2093, 2637], end + 0.5, 0.6, 0.04);
};

// ✨ XP gain - coins/gems collecting jingle
export const playXPGainSound = (amount: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const count = Math.min(Math.ceil(amount / 5), 8);
  for (let i = 0; i < count; i++) {
    // Coin-like "ching" sounds ascending
    playTone(800 + i * 150, t + i * 0.035, 0.06, 0.08, 'triangle');
    playTone(1600 + i * 150, t + i * 0.035 + 0.01, 0.04, 0.03, 'sine');
  }
  // Final satisfying "ka-ching!"
  playTone(2000, t + count * 0.035, 0.12, 0.06, 'sine');
};

// 🃏 Card flip - whooshy flip sound
export const playFlipSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  ensureContext();
  // Quick frequency sweep for "flip" effect
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.04);
  osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
  osc.start(t);
  osc.stop(t + 0.08);
};

// 🎯 Match found - happy recognition jingle
export const playMatchSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(523, t, 0.1, 0.15);
  playTone(659, t + 0.05, 0.1, 0.15);
  playTone(784, t + 0.1, 0.12, 0.18);
  playTone(1047, t + 0.16, 0.15, 0.12);
  playBoing(1047, t + 0.2, 0.06);
  playSparkleTrail(t + 0.25, 3, 0.03);
};

// ⏳ Countdown beep - urgency that's exciting, not scary
export const playCountdownBeep = (remaining: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  if (remaining <= 3) {
    // Dramatic but fun
    playTone(800, t, 0.08, 0.18);
    playTone(400, t + 0.04, 0.06, 0.08, 'square');
  } else {
    playTone(600, t, 0.06, 0.08);
  }
};

// ─── Background Music (Cartoon-style playful loop) ───
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let bgMusicGain: GainNode | null = null;

// Cheerful pentatonic melody - sounds like a cartoon adventure
const bgMelody = [
  523, 587, 659, 784, 880,  // C D E G A ascending
  784, 659, 587, 523, 440,  // descending
  523, 659, 784, 880, 1047, // back up higher
  880, 784, 659, 523, 587,  // playful descent
  659, 784, 880, 784, 659,  // bouncy middle
  523, 440, 523, 587, 659,  // gentle rise
  784, 659, 523, 440, 523,  // resolution
  587, 659, 784, 523, 440,  // outro
];

// Warm bass harmony underneath
const bgBass = [
  262, 262, 330, 392, 440,
  392, 330, 294, 262, 220,
  262, 330, 392, 440, 523,
  440, 392, 330, 262, 294,
  330, 392, 440, 392, 330,
  262, 220, 262, 294, 330,
  392, 330, 262, 220, 262,
  294, 330, 392, 262, 220,
];

export const startBgMusic = () => {
  if (!audioCtx || !isMusicEnabled() || bgMusicInterval) return;
  ensureContext();

  bgMusicGain = audioCtx.createGain();
  bgMusicGain.gain.setValueAtTime(0.035, audioCtx.currentTime);
  bgMusicGain.connect(audioCtx.destination);

  let noteIndex = 0;
  const playNote = () => {
    if (!audioCtx || !bgMusicGain || !isMusicEnabled()) { stopBgMusic(); return; }
    const idx = noteIndex % bgMelody.length;

    // Melody - warm triangle wave (music box feel)
    const osc1 = audioCtx.createOscillator();
    const noteGain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(bgMelody[idx], audioCtx.currentTime);
    noteGain1.gain.setValueAtTime(0.04, audioCtx.currentTime);
    noteGain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.38);
    osc1.connect(noteGain1);
    noteGain1.connect(bgMusicGain);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.4);

    // Bass - very soft sine, grounding
    const osc2 = audioCtx.createOscillator();
    const noteGain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(bgBass[idx], audioCtx.currentTime);
    noteGain2.gain.setValueAtTime(0.015, audioCtx.currentTime);
    noteGain2.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.42);
    osc2.connect(noteGain2);
    noteGain2.connect(bgMusicGain);
    osc2.start(audioCtx.currentTime);
    osc2.stop(audioCtx.currentTime + 0.45);

    // Every 8th note: add a subtle sparkle overtone
    if (idx % 8 === 0) {
      const osc3 = audioCtx.createOscillator();
      const noteGain3 = audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(bgMelody[idx] * 3, audioCtx.currentTime);
      noteGain3.gain.setValueAtTime(0.008, audioCtx.currentTime);
      noteGain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc3.connect(noteGain3);
      noteGain3.connect(bgMusicGain);
      osc3.start(audioCtx.currentTime);
      osc3.stop(audioCtx.currentTime + 0.32);
    }

    noteIndex++;
  };

  playNote();
  bgMusicInterval = setInterval(playNote, 420); // Slightly faster = more playful
};

export const stopBgMusic = () => {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  bgMusicGain = null;
};

// 🖍️ Chalk writing sound — scratchy texture that sounds like chalk on a board
let chalkWritingInterval: ReturnType<typeof setInterval> | null = null;

export const playChalkWriteSound = (durationMs: number = 800) => {
  if (!audioCtx || !isSoundEnabled()) return;
  ensureContext();

  const startTime = audioCtx.currentTime;
  let elapsed = 0;
  const stepMs = 60;

  const writeStep = () => {
    if (!audioCtx || elapsed >= durationMs) {
      stopChalkWriteSound();
      return;
    }
    const t = audioCtx.currentTime;

    // Scratchy noise burst — filtered white noise via oscillator detuning
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Randomize frequency for scratchy texture
    const baseFreq = 1800 + Math.random() * 2400;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + (Math.random() - 0.5) * 800, t + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500 + Math.random() * 1500, t);
    filter.Q.setValueAtTime(1.5 + Math.random() * 2, t);

    // Very short burst with random volume for organic feel
    const vol = 0.02 + Math.random() * 0.025;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04 + Math.random() * 0.02);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.06);

    // Occasional tap/click for chalk hitting the board
    if (Math.random() > 0.6) {
      const tap = audioCtx.createOscillator();
      const tapGain = audioCtx.createGain();
      tap.type = 'square';
      tap.frequency.setValueAtTime(3000 + Math.random() * 2000, t);
      tapGain.gain.setValueAtTime(0.01, t);
      tapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      tap.connect(tapGain);
      tapGain.connect(audioCtx.destination);
      tap.start(t);
      tap.stop(t + 0.02);
    }

    elapsed += stepMs;
  };

  writeStep();
  chalkWritingInterval = setInterval(writeStep, stepMs);

  // Safety stop
  setTimeout(() => stopChalkWriteSound(), durationMs + 100);
};

export const stopChalkWriteSound = () => {
  if (chalkWritingInterval) {
    clearInterval(chalkWritingInterval);
    chalkWritingInterval = null;
  }
};

// 🧹 Eraser / board wipe sound — soft whooshy friction
export const playEraserSound = (durationMs: number = 900) => {
  if (!audioCtx || !isSoundEnabled()) return;
  ensureContext();

  const t = audioCtx.currentTime;

  // Low rumble swoosh
  const rumble = audioCtx.createOscillator();
  const rumbleGain = audioCtx.createGain();
  const rumbleFilter = audioCtx.createBiquadFilter();
  rumble.type = 'sawtooth';
  rumble.frequency.setValueAtTime(120, t);
  rumble.frequency.linearRampToValueAtTime(180, t + durationMs / 1000);
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.setValueAtTime(400, t);
  rumbleGain.gain.setValueAtTime(0, t);
  rumbleGain.gain.linearRampToValueAtTime(0.04, t + 0.1);
  rumbleGain.gain.setValueAtTime(0.04, t + durationMs / 2000);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000);
  rumble.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(audioCtx.destination);
  rumble.start(t);
  rumble.stop(t + durationMs / 1000 + 0.05);

  // Breathy friction noise via detuned oscillators
  const dur = durationMs / 1000;
  for (let i = 0; i < 6; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const delay = i * (dur / 6);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 + Math.random() * 1200, t + delay);
    osc.frequency.linearRampToValueAtTime(600 + Math.random() * 800, t + delay + dur / 6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + Math.random() * 800, t + delay);
    filter.Q.setValueAtTime(0.8, t + delay);

    const vol = 0.015 + Math.random() * 0.01;
    gain.gain.setValueAtTime(0, t + delay);
    gain.gain.linearRampToValueAtTime(vol, t + delay + 0.03);
    gain.gain.linearRampToValueAtTime(vol * 0.8, t + delay + dur / 7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur / 5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t + delay);
    osc.stop(t + delay + dur / 4);
  }
};
