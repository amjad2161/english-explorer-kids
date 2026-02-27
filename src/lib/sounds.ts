// Advanced Sound System with Web Speech API & Rich Audio
const SOUND_KEY = "english-fun-sound-enabled";
const MUSIC_KEY = "english-fun-music-enabled";

export const isSoundEnabled = (): boolean => localStorage.getItem(SOUND_KEY) !== "false";
export const isMusicEnabled = (): boolean => localStorage.getItem(MUSIC_KEY) !== "false";
export const setSoundEnabled = (v: boolean) => localStorage.setItem(SOUND_KEY, String(v));
export const setMusicEnabled = (v: boolean) => {
  localStorage.setItem(MUSIC_KEY, String(v));
  if (!v) stopBgMusic();
};

// ─── Speech ───
export const speak = (text: string, lang: string = 'en-US', rate: number = 0.8) => {
  if (!('speechSynthesis' in window) || !isSoundEnabled()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.4;
  utterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v =>
    v.name.toLowerCase().includes('child') ||
    v.name.toLowerCase().includes('samantha') ||
    (lang === 'he-IL' && v.lang.startsWith('he'))
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  window.speechSynthesis.speak(utterance);
};

export const speakEnglish = (text: string) => speak(text, 'en-US', 0.75);
export const speakHebrew = (text: string) => speak(text, 'he-IL', 0.85);

// ─── Audio Context ───
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTone = (freq: number, start: number, dur: number, vol = 0.3, type: OscillatorType = 'sine') => {
  if (!audioCtx || !isSoundEnabled()) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
  osc.start(start);
  osc.stop(start + dur);
};

// Rich chord helper
const playChord = (freqs: number[], start: number, dur: number, vol = 0.12) => {
  freqs.forEach(f => playTone(f, start, dur, vol));
};

export const playCorrectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Rich major chord with sparkle cascade
  playTone(523, t, 0.15, 0.2);
  playTone(659, t + 0.06, 0.15, 0.2);
  playTone(784, t + 0.12, 0.2, 0.25);
  playTone(1047, t + 0.18, 0.15, 0.15);
  // Sparkle cascade
  playTone(1568, t + 0.2, 0.1, 0.06, 'triangle');
  playTone(2093, t + 0.25, 0.08, 0.04, 'triangle');
  playTone(2637, t + 0.3, 0.06, 0.03, 'triangle');
};

export const playWrongSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(220, t, 0.12, 0.15, 'sawtooth');
  playTone(180, t + 0.1, 0.12, 0.12, 'sawtooth');
  playTone(150, t + 0.2, 0.2, 0.1, 'square');
};

export const playClickSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(880, t, 0.04, 0.1);
  playTone(1320, t + 0.02, 0.03, 0.05, 'triangle');
};

export const playStarSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const scale = [523, 659, 784, 1047, 1319];
  scale.forEach((freq, i) => {
    playTone(freq, t + i * 0.08, 0.25, 0.12);
    playTone(freq * 2, t + i * 0.08, 0.12, 0.04, 'triangle');
  });
  // Final shimmer
  playChord([1047, 1319, 1568], t + scale.length * 0.08, 0.5, 0.06);
};

export const playComboSound = (combo: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const baseFreq = 400 + combo * 80;
  // Ascending arpeggio based on combo level
  [0, 0.05, 0.1, 0.15, 0.2].forEach((delay, i) => {
    playTone(baseFreq + i * 150, t + delay, 0.1, 0.18);
  });
  // Power chord on high combos
  if (combo >= 3) {
    playChord([baseFreq * 2, baseFreq * 2.5, baseFreq * 3], t + 0.22, 0.2, 0.08);
    // Sparkle sweep
    for (let i = 0; i < 4; i++) {
      playTone(2000 + i * 300, t + 0.25 + i * 0.03, 0.06, 0.03, 'triangle');
    }
  }
  if (combo >= 5) {
    // Epic power-up sound
    playTone(baseFreq * 4, t + 0.3, 0.3, 0.05, 'sine');
  }
};

export const playTickSound = () => {
  if (!audioCtx) return;
  playTone(1200, audioCtx.currentTime, 0.03, 0.06);
};

export const playTimerWarning = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(600, t, 0.08, 0.2);
  playTone(400, t + 0.1, 0.12, 0.2);
  playTone(300, t + 0.22, 0.15, 0.15);
};

export const playVictoryFanfare = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Triumphant fanfare melody
  const melody = [392, 392, 523, 523, 659, 659, 784, 1047];
  melody.forEach((freq, i) => {
    playTone(freq, t + i * 0.12, 0.16, 0.2);
  });
  // Harmony layers
  playChord([523, 659, 784], t + melody.length * 0.12, 0.5, 0.1);
  playChord([523, 784, 1047], t + melody.length * 0.12 + 0.3, 0.6, 0.1);
  playChord([659, 1047, 1319], t + melody.length * 0.12 + 0.6, 0.8, 0.08);
  // Final sparkle cascade
  for (let i = 0; i < 6; i++) {
    playTone(1047 + i * 200, t + melody.length * 0.12 + 0.8 + i * 0.04, 0.1, 0.03, 'triangle');
  }
};

export const playLetterPopSound = (index: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const freq = 300 + index * 80;
  playTone(freq, t, 0.08, 0.12);
  playTone(freq * 2, t + 0.02, 0.05, 0.04, 'triangle');
  // Subtle resonance
  playTone(freq * 1.5, t + 0.04, 0.06, 0.03, 'sine');
};

export const playWelcomeChime = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const notes = [392, 440, 523, 659, 784, 1047];
  notes.forEach((freq, i) => playTone(freq, t + i * 0.14, 0.3, 0.12));
  playChord([523, 659, 784, 1047], t + notes.length * 0.14, 0.6, 0.06);
};

export const playSelectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(440, t, 0.06, 0.12);
  playTone(660, t + 0.04, 0.08, 0.12);
  playTone(880, t + 0.08, 0.1, 0.08);
};

export const playLevelUpSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  // Fast ascending scale
  const scale = [523, 587, 659, 698, 784, 880, 988, 1047];
  scale.forEach((freq, i) => {
    playTone(freq, t + i * 0.06, 0.15, 0.12 + i * 0.01);
    if (i >= 5) playTone(freq / 2, t + i * 0.06, 0.2, 0.08);
  });
  // Power chord finale
  playChord([1047, 1319, 1568], t + scale.length * 0.06, 0.8, 0.1);
  playChord([1568, 2093, 2637], t + scale.length * 0.06 + 0.3, 0.6, 0.05);
  // Twinkle trail
  for (let i = 0; i < 5; i++) {
    playTone(2093 + i * 200, t + scale.length * 0.06 + 0.5 + i * 0.06, 0.1, 0.02, 'triangle');
  }
};

export const playXPGainSound = (amount: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const count = Math.min(Math.ceil(amount / 5), 8);
  for (let i = 0; i < count; i++) {
    playTone(600 + i * 120, t + i * 0.04, 0.06, 0.08, 'triangle');
  }
  // Final coin sound
  playTone(1500, t + count * 0.04, 0.1, 0.05, 'sine');
};

// Card flip sound
export const playFlipSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(400, t, 0.04, 0.1, 'triangle');
  playTone(800, t + 0.02, 0.04, 0.06, 'sine');
};

// Match found jingle
export const playMatchSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(523, t, 0.1, 0.15);
  playTone(659, t + 0.06, 0.1, 0.15);
  playTone(784, t + 0.12, 0.15, 0.18);
  playTone(1047, t + 0.18, 0.12, 0.1);
  playTone(1568, t + 0.22, 0.08, 0.05, 'triangle');
};

// Countdown beep
export const playCountdownBeep = (remaining: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const freq = remaining <= 3 ? 800 : 600;
  playTone(freq, t, 0.06, remaining <= 3 ? 0.2 : 0.1);
  if (remaining <= 3) {
    playTone(freq * 0.5, t + 0.04, 0.08, 0.08, 'square');
  }
};


// ─── Background Music (rich synthesised loop) ───
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let bgMusicGain: GainNode | null = null;

const bgMelody = [
  262, 330, 392, 523, 392, 330, 294, 349,
  440, 523, 440, 349, 330, 392, 330, 262,
  294, 349, 440, 523, 659, 523, 440, 392,
  349, 330, 294, 262, 330, 392, 523, 392,
];

const bgHarmony = [
  131, 165, 196, 262, 196, 165, 147, 175,
  220, 262, 220, 175, 165, 196, 165, 131,
  147, 175, 220, 262, 330, 262, 220, 196,
  175, 165, 147, 131, 165, 196, 262, 196,
];

export const startBgMusic = () => {
  if (!audioCtx || !isMusicEnabled() || bgMusicInterval) return;

  bgMusicGain = audioCtx.createGain();
  bgMusicGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  bgMusicGain.connect(audioCtx.destination);

  let noteIndex = 0;
  const playNote = () => {
    if (!audioCtx || !bgMusicGain || !isMusicEnabled()) { stopBgMusic(); return; }
    const idx = noteIndex % bgMelody.length;
    
    // Melody
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(bgMelody[idx], audioCtx.currentTime);
    osc1.connect(bgMusicGain);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.35);
    
    // Harmony (quieter)
    const harmGain = audioCtx.createGain();
    harmGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    harmGain.connect(bgMusicGain);
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(bgHarmony[idx], audioCtx.currentTime);
    osc2.connect(harmGain);
    osc2.start(audioCtx.currentTime);
    osc2.stop(audioCtx.currentTime + 0.4);
    
    noteIndex++;
  };

  playNote();
  bgMusicInterval = setInterval(playNote, 450);
};

export const stopBgMusic = () => {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  bgMusicGain = null;
};
