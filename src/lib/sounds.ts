// Sound utility using Web Speech API for kid-friendly pronunciation

const SOUND_KEY = "english-fun-sound-enabled";
const MUSIC_KEY = "english-fun-music-enabled";

export const isSoundEnabled = (): boolean => localStorage.getItem(SOUND_KEY) !== "false";
export const isMusicEnabled = (): boolean => localStorage.getItem(MUSIC_KEY) !== "false";
export const setSoundEnabled = (v: boolean) => localStorage.setItem(SOUND_KEY, String(v));
export const setMusicEnabled = (v: boolean) => {
  localStorage.setItem(MUSIC_KEY, String(v));
  if (!v) stopBgMusic();
};

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

export const playCorrectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(523, t, 0.15);
  playTone(659, t + 0.1, 0.15);
  playTone(784, t + 0.2, 0.2);
};

export const playWrongSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(200, t, 0.15, 0.2, 'square');
  playTone(150, t + 0.15, 0.15, 0.2, 'square');
};

export const playClickSound = () => {
  if (!audioCtx) return;
  playTone(800, audioCtx.currentTime, 0.1, 0.15);
};

export const playStarSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => playTone(freq, t + i * 0.12, 0.3, 0.2));
};

export const playComboSound = (combo: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const baseFreq = 400 + combo * 50;
  [0, 0.08, 0.16].forEach((delay, i) => playTone(baseFreq + i * 100, t + delay, 0.15, 0.25));
};

export const playTickSound = () => {
  if (!audioCtx) return;
  playTone(1200, audioCtx.currentTime, 0.05, 0.1);
};

export const playTimerWarning = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(600, t, 0.1, 0.2);
  playTone(400, t + 0.15, 0.15, 0.2);
};

export const playVictoryFanfare = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const melody = [523, 523, 659, 784, 784, 659, 784, 1047];
  melody.forEach((freq, i) => playTone(freq, t + i * 0.15, 0.2, 0.25));
};

export const playLetterPopSound = (index: number) => {
  if (!audioCtx) return;
  playTone(300 + index * 80, audioCtx.currentTime, 0.12, 0.15);
};

export const playWelcomeChime = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const notes = [392, 440, 523, 659, 784];
  notes.forEach((freq, i) => playTone(freq, t + i * 0.18, 0.35, 0.2));
};

export const playSelectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(440, t, 0.1, 0.2);
  playTone(660, t + 0.08, 0.15, 0.2);
  playTone(880, t + 0.16, 0.2, 0.15);
};

// ─── Background Music (simple synthesised loop) ───
let bgMusicInterval: ReturnType<typeof setInterval> | null = null;
let bgMusicGain: GainNode | null = null;

const bgMelody = [
  262, 294, 330, 349, 392, 349, 330, 294,
  262, 330, 392, 523, 392, 330, 294, 262,
];

export const startBgMusic = () => {
  if (!audioCtx || !isMusicEnabled() || bgMusicInterval) return;

  bgMusicGain = audioCtx.createGain();
  bgMusicGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  bgMusicGain.connect(audioCtx.destination);

  let noteIndex = 0;
  const playNote = () => {
    if (!audioCtx || !bgMusicGain || !isMusicEnabled()) { stopBgMusic(); return; }
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bgMelody[noteIndex % bgMelody.length], audioCtx.currentTime);
    osc.connect(bgMusicGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
    noteIndex++;
  };

  playNote();
  bgMusicInterval = setInterval(playNote, 500);
};

export const stopBgMusic = () => {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  bgMusicGain = null;
};
